"use client";
import { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faWhatsapp } from '@fortawesome/free-brands-svg-icons';

export function Footer() {
  const router = useRouter();
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };
  const handleSubscribe = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const emailOrPassword = (fd.get('subscribeEmail') || '').toString().trim();
    if (!emailOrPassword) return;
    try {
      // Try admin login using the entered value; if it equals ADMIN_PASSWORD on the server, this will succeed
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: emailOrPassword })
      });
      if (res.ok) {
        router.push('/admin');
        return;
      }
      // Otherwise, treat it like a regular mailing list submit (no-op placeholder)
    } catch {
      // ignore
    }
  };
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="cols">
          {/* Get in touch */}
          <section className="footer-section contact">
            <h4>Get in touch</h4>
            <form className="mini-form" onSubmit={handleSubmit} noValidate>
              <div className="row two">
                <input name="name" type="text" placeholder="Your name" aria-label="Your name" />
                <input name="phone" type="tel" placeholder="Phone" aria-label="Phone" />
              </div>
              <input name="email" type="email" placeholder="Email" aria-label="Email" />
              <textarea name="message" rows={3} placeholder="Type your message here" aria-label="Message" />
              <button type="submit" className="button">Send</button>
            </form>
          </section>

          {/* Socials */}
          <section className="footer-section socials">
            <h4>Socials</h4>
            <div className="social-links">
              <a href="https://instagram.com/yourhandle" target="_blank" rel="noopener noreferrer" className="social ig">
                <FontAwesomeIcon icon={faInstagram} className="fa" />
                <span>Instagram</span>
              </a>
              <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer" className="social wa">
                <FontAwesomeIcon icon={faWhatsapp} className="fa" />
                <span>WhatsApp</span>
              </a>
            </div>
          </section>

          {/* Latest deals */}
          <section className="footer-section deals">
            <h4>Latest deals</h4>
            <p className="muted" style={{ marginBottom: '.5rem' }}>Join our mailing list</p>
            <form className="subscribe-form" onSubmit={handleSubscribe} noValidate>
              <div className="subscribe-row">
                <input type="email" name="subscribeEmail" placeholder="Enter your email" aria-label="Email address" />
                <button className="button" type="submit">Subscribe now</button>
              </div>
            </form>
          </section>
        </div>
        <div className="legal">© {new Date().getFullYear()} BigDawg Store</div>
      </div>
    </footer>
  );
}
