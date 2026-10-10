"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { PARTIES } from "@/content/parties";
import { makeNumber, saveRecord, type ReservationRecord } from "@/lib/store";
import ui from "@/components/site/ui.module.css";
import styles from "./PartyBuilder.module.css";

const STEPS = [
  { key: "party", label: "Your Party", line: "What kind of party are we building?" },
  { key: "where", label: "When & Where", line: "We'll confirm setup timing after we check your space." },
  { key: "space", label: "Space Check", line: "Just enough for us to know what we're walking into." },
  { key: "details", label: "Your Details", line: "One last thing — how should ROOMi reach you?" },
] as const;

const GUESTS = ["1–5", "6–10", "11–20", "20+"];
const DURATIONS = ["2 hours", "3 hours", "4 hours", "5 hours", "6 hours"];
const SPACE_TYPES = ["Apartment", "House", "Studio", "Rooftop", "Rental Space", "Other"];
const SPACE_Q: { key: string; label: string; options: string[] }[] = [
  { key: "size", label: "Size", options: ["Small", "Medium", "Large"] },
  { key: "elevator", label: "Elevator", options: ["Yes", "No"] },
  { key: "setting", label: "Setting", options: ["Indoor", "Outdoor"] },
  { key: "parking", label: "Parking / Loading", options: ["Available", "Not sure", "None"] },
  { key: "noise", label: "Noise restrictions", options: ["None", "Yes", "Not sure"] },
];
const CONTACTS = ["Text", "KakaoTalk", "Email"];

type Form = {
  party: string;
  partyOther: string;
  addOns: string[];
  guests: string;
  vibe: string;
  vibeOther: string;
  date: string;
  start: string;
  duration: string;
  address: string;
  addressDetail: string;
  spaceType: string;
  spaceOther: string;
  space: Record<string, string>;
  name: string;
  phone: string;
  email: string;
  contact: string;
  request: string;
  agree: boolean;
};

const EMPTY: Form = {
  party: "",
  partyOther: "",
  addOns: [],
  guests: "",
  vibe: "",
  vibeOther: "",
  date: "",
  start: "19:00",
  duration: "3 hours",
  address: "",
  addressDetail: "",
  spaceType: "",
  spaceOther: "",
  space: {},
  name: "",
  phone: "",
  email: "",
  contact: "Text",
  request: "",
  agree: false,
};

function tomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function Choices({
  name,
  options,
  value,
  onChange,
  multiple,
}: {
  name: string;
  options: string[];
  value: string | string[];
  onChange: (v: string) => void;
  multiple?: boolean;
}) {
  return (
    <div className={ui.choices} role={multiple ? "group" : "radiogroup"}>
      {options.map((o) => (
        <label key={o} className={ui.choice}>
          <input
            type={multiple ? "checkbox" : "radio"}
            name={name}
            value={o}
            checked={multiple ? (value as string[]).includes(o) : value === o}
            onChange={() => onChange(o)}
          />
          <span>{o}</span>
        </label>
      ))}
    </div>
  );
}

/** Shown under a choice group when "Other" is picked, so people can write what they actually want. */
function OtherInput({ value, onChange, placeholder, label, error }: { value: string; onChange: (v: string) => void; placeholder: string; label: string; error?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => ref.current?.focus(), []);
  return (
    <div className={styles.other}>
      <input ref={ref} className={ui.input} aria-label={label} placeholder={placeholder} maxLength={40} value={value} aria-invalid={!!error} onChange={(e) => onChange(e.target.value)} />
      {error && <p className={ui.error}>{error}</p>}
    </div>
  );
}

const resolve = (choice: string, other: string) => (choice === "Other" ? other.trim() : choice);

export default function PartyBuilder() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState<ReservationRecord | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const topRef = useRef<HTMLDivElement>(null);

  // Arriving from a scene page (?party=house-party) preselects that party.
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("party");
    const party = PARTIES.find((p) => p.slug === slug);
    if (party) setForm((f) => ({ ...f, party: party.name }));
  }, []);

  useEffect(() => () => photos.forEach((u) => URL.revokeObjectURL(u)), [photos]);

  const selected = PARTIES.find((p) => p.name === form.party);
  const vibes = useMemo(() => [...(selected ? selected.spec.sound.split(" / ") : ["House", "Disco", "Funk", "Indie Dance"]), "Other"], [selected]);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => ({ ...f, [key]: value }));

  const validate = (s: number) => {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (!form.party) e.party = "파티 종류를 골라 주세요.";
      else if (form.party === "Other" && !form.partyOther.trim()) e.partyOther = "원하는 파티를 직접 적어 주세요.";
      if (!form.guests) e.guests = "인원을 골라 주세요.";
      if (form.vibe === "Other" && !form.vibeOther.trim()) e.vibeOther = "원하는 분위기를 직접 적어 주세요.";
    }
    if (s === 1) {
      if (!form.date) e.date = "날짜를 골라 주세요.";
      if (!form.address.trim()) e.address = "주소를 입력해 주세요. 전시용이라 실제 주소가 아니어도 돼요.";
      if (!form.spaceType) e.spaceType = "공간 유형을 골라 주세요.";
      else if (form.spaceType === "Other" && !form.spaceOther.trim()) e.spaceOther = "공간 유형을 직접 적어 주세요.";
    }
    if (s === 2) {
      SPACE_Q.forEach((q) => {
        if (!form.space[q.key]) e[q.key] = `${q.label}을(를) 골라 주세요.`;
      });
    }
    if (s === 3) {
      if (!form.name.trim()) e.name = "이름을 입력해 주세요.";
      if (!/^0\d{1,2}-?\d{3,4}-?\d{4}$/.test(form.phone.trim())) e.phone = "010-0000-0000 형식으로 입력해 주세요.";
      if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = "이메일 형식을 확인해 주세요.";
      if (!form.agree) e.agree = "예약·취소 규정에 동의해 주세요.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const go = (to: number) => {
    setStep(to);
    setErrors({});
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const next = () => {
    if (!validate(step)) return;
    if (step < STEPS.length - 1) return go(step + 1);
    const record: ReservationRecord = {
      kind: "reservation",
      number: makeNumber("R"),
      createdAt: new Date().toISOString(),
      party: resolve(form.party, form.partyOther),
      addOns: form.addOns,
      guests: form.guests,
      vibe: resolve(form.vibe, form.vibeOther),
      date: form.date,
      start: form.start,
      duration: form.duration,
      spaceType: resolve(form.spaceType, form.spaceOther),
      area: [form.address, form.addressDetail].filter(Boolean).join(" "),
      space: form.space,
      name: form.name,
      contact: `${form.contact} · ${form.phone}${form.email ? ` · ${form.email}` : ""}`,
      request: form.request,
      status: "문의 접수",
    };
    saveRecord(record);
    setDone(record);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (done) {
    return (
      <main className={styles.page}>
        <div ref={topRef} />
        <section className={styles.done} aria-live="polite">
          <p className={ui.demo}>Exhibition demo · 실제 문의가 아니에요</p>
          <h1 className={styles.doneTitle}>
            Request
            <br />
            sent.
          </h1>
          <p className={styles.doneLead}>예약 문의가 접수됐어요. 공간과 일정을 확인한 뒤 연락드려요.</p>
          <p className={styles.doneNumber}>
            문의번호 <strong>{done.number}</strong>
          </p>
          <dl className={styles.summary}>
            <dt>Party</dt>
            <dd>
              {done.party}
              {done.addOns.length > 0 && ` + ${done.addOns.join(", ")}`}
            </dd>
            <dt>When</dt>
            <dd>
              {done.date} · {done.start} 시작 · {done.duration}
            </dd>
            <dt>Where</dt>
            <dd>
              {done.spaceType} · {done.area}
            </dd>
            <dt>Guests</dt>
            <dd>{done.guests}</dd>
            <dt>Contact</dt>
            <dd>
              {done.name} · {done.contact}
            </dd>
          </dl>
          <p className={ui.hint}>문의번호는 이 브라우저에 저장돼요. My에서 번호로 다시 조회할 수 있어요.</p>
          <div className={styles.doneActions}>
            <Link className={ui.button} href={`/my?no=${done.number}`}>
              My에서 확인하기 →
            </Link>
            <button
              type="button"
              className={ui.ghost}
              onClick={() => {
                setDone(null);
                setForm(EMPTY);
                setStep(0);
              }}
            >
              Build another party
            </button>
          </div>
        </section>
      </main>
    );
  }

  const s = STEPS[step];

  return (
    <main className={styles.page}>
      <div ref={topRef} className={styles.anchor} />
      <header className={styles.head}>
        <h1 className={styles.title}>Build your party</h1>
        <p className={styles.standfirst}>
          <span>Tell us the basics. We&apos;ll take care of the setup.</span>
          <span className={styles.notice}>
            <strong>예약 문의</strong>
            바로 예약이 확정되는 게 아니에요. 보내 주시면 ROOMi가 공간과 일정을 확인한 뒤 연락드려요.
          </span>
          <span className={ui.demo}>Exhibition demo</span>
        </p>
      </header>

      <ol className={styles.stepper} aria-label="예약 문의 단계">
        {STEPS.map((st, i) => (
          <li key={st.key} data-state={i < step ? "done" : i === step ? "current" : "todo"} aria-current={i === step ? "step" : undefined}>
            {i < step ? (
              <button type="button" onClick={() => go(i)}>
                <span>0{i + 1}</span> {st.label}
              </button>
            ) : (
              <span className={styles.stepLabel}>
                <span>0{i + 1}</span> {st.label}
              </span>
            )}
          </li>
        ))}
      </ol>

      <form
        className={styles.form}
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          next();
        }}
      >
        <div className={styles.stepHead}>
          <span className={styles.stepNo}>0{step + 1}</span>
          <h2>{s.label}</h2>
          <p>{s.line}</p>
        </div>

        {step === 0 && (
          <div className={styles.fields}>
            <div className={styles.field} data-wide>
              <span className={ui.label} id="lbl-party">Party type</span>
              <Choices
                name="party"
                options={[...PARTIES.map((p) => p.name), "Other"]}
                value={form.party}
                onChange={(v) => setForm((f) => ({ ...f, party: v, addOns: [], vibe: "", vibeOther: "" }))}
              />
              {form.party === "Other" && (
                <OtherInput value={form.partyOther} onChange={(v) => set("partyOther", v)} label="원하는 파티" placeholder="어떤 파티를 열고 싶나요? (예: 생일 파티, 졸업 파티)" error={errors.partyOther} />
              )}
              {errors.party && <p className={ui.error}>{errors.party}</p>}
            </div>
            <div className={styles.field} data-wide>
              <span className={ui.label}>Guests</span>
              <Choices name="guests" options={GUESTS} value={form.guests} onChange={(v) => set("guests", v)} />
              {errors.guests && <p className={ui.error}>{errors.guests}</p>}
            </div>
            <div className={styles.field} data-wide>
              <span className={ui.label}>Vibe</span>
              <Choices name="vibe" options={vibes} value={form.vibe} onChange={(v) => set("vibe", v)} />
              {form.vibe === "Other" && <OtherInput value={form.vibeOther} onChange={(v) => set("vibeOther", v)} label="원하는 분위기" placeholder="어떤 음악이나 분위기를 원하나요?" error={errors.vibeOther} />}
            </div>
            {selected && (
              <div className={styles.field} data-wide>
                <span className={ui.label}>Add-ons (optional)</span>
                <Choices
                  name="addons"
                  multiple
                  options={selected.addOns.map((a) => a.title)}
                  value={form.addOns}
                  onChange={(v) => set("addOns", form.addOns.includes(v) ? form.addOns.filter((x) => x !== v) : [...form.addOns, v])}
                />
              </div>
            )}
          </div>
        )}

        {step === 1 && (
          <div className={styles.fields}>
            <div className={styles.field}>
              <label className={ui.label} htmlFor="date">Date</label>
              <input id="date" className={ui.input} type="date" min={tomorrow()} value={form.date} aria-invalid={!!errors.date} onChange={(e) => set("date", e.target.value)} />
              {errors.date && <p className={ui.error}>{errors.date}</p>}
            </div>
            <div className={styles.field}>
              <label className={ui.label} htmlFor="start">Party start</label>
              <input id="start" className={ui.input} type="time" value={form.start} onChange={(e) => set("start", e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={ui.label} htmlFor="duration">Duration</label>
              <select id="duration" className={ui.select} value={form.duration} onChange={(e) => set("duration", e.target.value)}>
                {DURATIONS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className={styles.field} data-half>
              <label className={ui.label} htmlFor="address">Address</label>
              <input id="address" className={ui.input} placeholder="Street address" value={form.address} aria-invalid={!!errors.address} onChange={(e) => set("address", e.target.value)} />
              {errors.address && <p className={ui.error}>{errors.address}</p>}
            </div>
            <div className={styles.field} data-half>
              <label className={ui.label} htmlFor="address2">Detail address</label>
              <input id="address2" className={ui.input} placeholder="Apt / floor / unit" value={form.addressDetail} onChange={(e) => set("addressDetail", e.target.value)} />
            </div>
            <div className={styles.field} data-wide>
              <span className={ui.label}>Space type</span>
              <Choices name="spaceType" options={SPACE_TYPES} value={form.spaceType} onChange={(v) => set("spaceType", v)} />
              {form.spaceType === "Other" && (
                <OtherInput value={form.spaceOther} onChange={(v) => set("spaceOther", v)} label="공간 유형" placeholder="어떤 공간인가요? (예: 카페, 지하 연습실)" error={errors.spaceOther} />
              )}
              {errors.spaceType && <p className={ui.error}>{errors.spaceType}</p>}
            </div>
            <p className={ui.hint} data-wide>
              Party starts when you want. ROOMiVERSE arrives earlier for setup.
            </p>
          </div>
        )}

        {step === 2 && (
          <div className={styles.fields}>
            {SPACE_Q.map((q) => (
              <div key={q.key} className={styles.field} data-half>
                <span className={ui.label}>{q.label}</span>
                <Choices name={q.key} options={q.options} value={form.space[q.key] ?? ""} onChange={(v) => set("space", { ...form.space, [q.key]: v })} />
                {errors[q.key] && <p className={ui.error}>{errors[q.key]}</p>}
              </div>
            ))}
            <div className={styles.photoBox} data-half>
              <span className={ui.label}>Show us your space</span>
              <p className={ui.hint}>사진 1–3장 · 선택 · 이 화면에서만 미리 보고 저장하지 않아요.</p>
              <label className={ui.ghost}>
                + Add photos
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={(e) => {
                    const files = Array.from(e.target.files ?? []).slice(0, 3);
                    setPhotos(files.map((f) => URL.createObjectURL(f)));
                  }}
                />
              </label>
              {photos.length > 0 && (
                <div className={styles.thumbs}>
                  {photos.map((u) => (
                    <img key={u} src={u} alt="업로드한 공간 사진 미리보기" />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className={styles.fields}>
            <div className={styles.field}>
              <label className={ui.label} htmlFor="name">Name</label>
              <input id="name" className={ui.input} placeholder="Your name" autoComplete="name" value={form.name} aria-invalid={!!errors.name} onChange={(e) => set("name", e.target.value)} />
              {errors.name && <p className={ui.error}>{errors.name}</p>}
            </div>
            <div className={styles.field}>
              <label className={ui.label} htmlFor="phone">Phone</label>
              <input id="phone" className={ui.input} placeholder="010-0000-0000" inputMode="tel" autoComplete="tel" value={form.phone} aria-invalid={!!errors.phone} onChange={(e) => set("phone", e.target.value)} />
              {errors.phone && <p className={ui.error}>{errors.phone}</p>}
            </div>
            <div className={styles.field}>
              <label className={ui.label} htmlFor="email">Email (optional)</label>
              <input id="email" className={ui.input} placeholder="you@email.com" inputMode="email" autoComplete="email" value={form.email} aria-invalid={!!errors.email} onChange={(e) => set("email", e.target.value)} />
              {errors.email && <p className={ui.error}>{errors.email}</p>}
            </div>
            <div className={styles.field} data-wide>
              <span className={ui.label}>Preferred contact</span>
              <Choices name="contact" options={CONTACTS} value={form.contact} onChange={(v) => set("contact", v)} />
            </div>
            <div className={styles.field} data-wide>
              <label className={ui.label} htmlFor="request">Special request</label>
              <textarea id="request" className={ui.textarea} placeholder="Tell us anything we should know — music, lighting, timing, occasion..." value={form.request} onChange={(e) => set("request", e.target.value)} />
            </div>
            <label className={styles.agree} data-wide>
              <input type="checkbox" checked={form.agree} onChange={(e) => set("agree", e.target.checked)} />
              <span>예약·취소 규정에 동의해요. (전시용 시뮬레이터 · 실제 예약·결제는 발생하지 않아요)</span>
            </label>
            {errors.agree && <p className={ui.error} data-wide>{errors.agree}</p>}
          </div>
        )}

        <div className={styles.actions}>
          {step > 0 ? (
            <button type="button" className={ui.ghost} onClick={() => go(step - 1)}>
              ← Back
            </button>
          ) : (
            <span />
          )}
          <button type="submit" className={ui.button}>
            {step < STEPS.length - 1 ? "Next →" : "예약 문의 보내기 →"}
          </button>
        </div>
      </form>
    </main>
  );
}
