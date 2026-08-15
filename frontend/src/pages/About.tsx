import { Link } from 'react-router-dom'
import { ProximityHeading } from '../components/text/ProximityHeading'

const WHY_CHOOSE = [
  'Signature embroidery on every piece',
  'Premium fabric, built to last',
  'Fair pricing, no unnecessary markup',
  'Shipped fast, across India',
]

export function About() {
  return (
    <div className="relative overflow-hidden px-4 pb-20 pt-6 sm:pb-28 sm:pt-10">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem]"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 65% 100% at 50% -10%, rgba(var(--color-accent-rgb), 0.5), transparent 70%)',
        }}
      />

      <div className="relative mx-auto max-w-[950px] rounded-[24px] border border-white/10 bg-black/30 p-8 backdrop-blur-2xl sm:p-12">
        <div className="flex justify-center">
          <div className="inline-block rounded-full border border-white/10 bg-black px-8 py-3 shadow-lg sm:px-10 sm:py-4">
            <ProximityHeading as="h1" className="text-center text-3xl font-bold text-white sm:text-4xl" radius={140}>
              About DotKnot
            </ProximityHeading>
          </div>
        </div>

        <p className="mx-auto mt-6 max-w-2xl text-center text-[#c5c5c5]">
          <span className="font-bold text-accent">DotKnot</span> is an everyday apparel label built around
          detail. Every piece is designed with intention, made to be worn often and to last.
        </p>

        <div className="mt-10 space-y-10 sm:mt-12 sm:space-y-10">
          <section>
            <h2 className="mb-3 text-xl font-bold text-accent sm:text-2xl">Our Mission</h2>
            <p className="text-[#c5c5c5]">
              To make apparel that feels personal — where every stitch and detail reflects genuine
              craftsmanship, without the premium markup. We want quality basics to be effortless, not a
              luxury.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-accent sm:text-2xl">Why Choose DotKnot?</h2>
            <ul className="space-y-2">
              {WHY_CHOOSE.map((point) => (
                <li key={point} className="flex items-start gap-3 text-[#c5c5c5]">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-accent sm:text-2xl">Our Story</h2>
            <p className="text-[#c5c5c5]">
              DotKnot started with a simple idea — apparel that feels considered, not mass-produced. What
              began as a small embroidery project has grown into a full wardrobe of everyday essentials,
              each piece designed with the same attention to detail we started with.
            </p>
          </section>
        </div>

        <div className="mt-12 text-center sm:mt-14">
          <p className="text-lg font-bold text-accent sm:text-xl">Join the DotKnot Family</p>
          <p className="mx-auto mt-2 max-w-md text-[#c5c5c5]">
            Explore our latest drops and be part of a growing community that values quality and detail.
          </p>
          <Link
            to="/products"
            className="mt-6 inline-block rounded-full bg-accent px-8 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-accent-soft"
          >
            Shop Now
          </Link>
        </div>
      </div>
    </div>
  )
}
