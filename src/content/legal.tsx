import { SITE } from './site'

const heading = 'font-semibold text-slate-800'

export function PrivacyContent() {
  return (
    <>
      <p>
        {SITE.name} is privacy-first by design. Every password is generated
        entirely on your device using your browser&apos;s built-in Web Crypto
        API.
      </p>
      <p className={heading}>What we collect</p>
      <p>
        Nothing. {SITE.name} has no backend, no database and no user accounts.
        Generated passwords are never transmitted, logged, or stored — not in
        localStorage, sessionStorage, cookies, IndexedDB, or on any server.
      </p>
      <p className={heading}>&ldquo;Remember my settings&rdquo;</p>
      <p>
        If you turn this on, your chosen generator type and options (e.g. word
        count, length, separators, symbols) are saved in your browser&apos;s
        local storage so they&apos;re restored on your next visit. This only
        ever stores configuration — never a generated password. Turning the
        toggle off immediately removes this data from your device.
      </p>
      <p className={heading}>Analytics</p>
      <p>
        This site does not include third-party analytics or advertising. If
        analytics are ever added, they will never capture password values or
        generator output.
      </p>
      <p className={heading}>Your responsibility</p>
      <p>
        Because passwords live only in your browser tab, copying one to your
        clipboard hands it to your operating system. Clear your clipboard when
        appropriate and store passwords in a trusted password manager.
      </p>
    </>
  )
}

export function TermsContent() {
  return (
    <>
      <p>
        By using {SITE.name} you agree to these terms. If you do not agree,
        please do not use the service.
      </p>
      <p className={heading}>Provided &ldquo;as is&rdquo;</p>
      <p>
        {SITE.name} is provided free of charge, without warranty of any kind,
        express or implied. While it uses cryptographically secure randomness,
        no tool can guarantee that a password will never be compromised through
        reuse, phishing, malware, or a breach of the site where it is used.
      </p>
      <p className={heading}>No liability</p>
      <p>
        To the maximum extent permitted by law, {SITE.developer} is not liable
        for any loss or damage arising from the use of, or inability to use,
        this service.
      </p>
      <p className={heading}>Acceptable use</p>
      <p>
        You are responsible for how you use generated passwords. Do not use{' '}
        {SITE.name} for any unlawful purpose.
      </p>
      <p className={heading}>Changes</p>
      <p>
        These terms may be updated over time. Continued use of the service
        constitutes acceptance of the current terms.
      </p>
    </>
  )
}

export function ContactContent() {
  return (
    <>
      <p>
        {SITE.name} is built and maintained by {SITE.developer}. We&apos;d love
        to hear your feedback, bug reports and ideas.
      </p>
      <p>
        <span className={heading}>Email:</span>{' '}
        <a
          className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
          href={`mailto:${SITE.contactEmail}`}
        >
          {SITE.contactEmail}
        </a>
      </p>
      <p>
        <span className={heading}>Source code:</span>{' '}
        <a
          className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
          href={SITE.githubUrl}
          target="_blank"
          rel="noreferrer"
        >
          {SITE.githubUrl}
        </a>
      </p>
      <p className="text-xs text-slate-400">
        Please never send us a real password. We will never ask for one.
      </p>
    </>
  )
}
