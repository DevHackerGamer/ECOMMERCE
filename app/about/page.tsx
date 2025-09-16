export const metadata = { title: 'About | BigDawg Sneakers' };

export default function AboutPage() {
  return (
    <div style={{padding:'2.5rem 0', maxWidth:760}}>
      <h1 style={{fontSize:'2rem', marginBottom:'1rem'}}>About BigDawg</h1>
      <p className="muted" style={{lineHeight:1.6}}>
        BigDawg is a dedicated storefront for our curated collection of authentic, premium sneakers. This
        isn&apos;t an open marketplace or peer-to-peer resale platform — every pair listed here is sourced,
        inspected, and stocked directly by our team. Our focus is on legitimacy, condition transparency,
        and a smooth purchase experience.
      </p>
      <p className="muted" style={{lineHeight:1.6, marginTop:'1rem'}}>
        As we build out the platform you&apos;ll see additions like detailed product provenance, release
        histories, sizing guidance, and secure checkout. For now this UI is a foundation you can extend
        with real data and operational workflows.
      </p>
    </div>
  );
}
