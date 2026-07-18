/**
 * Decorative blurred-orb + grid-pattern background used behind full-bleed
 * primary-gradient CTA sections. Render inside a `relative overflow-hidden`
 * section as the first child.
 */
export function CTAGridBackground() {
  return (
    <div className="absolute inset-0">
      <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-400/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl">
        <svg className="w-full h-full opacity-5" viewBox="0 0 200 200">
          <pattern
            id="grid"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="white"
              strokeWidth="0.5"
            />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
    </div>
  );
}
