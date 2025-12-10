export default function Footer() {
  return (
    <footer className="mt-8 border-t bg-white/70 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-6 text-sm text-gray-600 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p>
          © {new Date().getFullYear()} Project Manager · Crafted with ❤️
        </p>
        <nav className="flex items-center gap-4">
          <a href="/dashboard" className="hover:text-gray-900">Dashboard</a>
          <a href="/projects" className="hover:text-gray-900">Projects</a>
          <a href="/tasks" className="hover:text-gray-900">Tasks</a>
        </nav>
      </div>
    </footer>
  );
}
