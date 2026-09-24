import Button from './ui/Button';

// Placeholder for pages that are not designed yet. These routes are not linked
// from the navigation or footer until their content exists.
export default function ComingSoon({ title }: { title: string }) {
  return (
    <section className="container-page flex min-h-[70vh] flex-col items-center justify-center text-center">
      <h1 className="mt-3 text-4xl font-semibold text-text-primary sm:text-5xl">{title}</h1>
      <p className="mt-4 max-w-md text-text-secondary">
        We&apos;re still putting this page together. In the meantime, see how Sponsor Studio works.
      </p>
      <Button href="/" variant="secondary" className="mt-8">
        Back to home
      </Button>
    </section>
  );
}
