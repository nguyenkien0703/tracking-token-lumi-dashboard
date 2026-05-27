export default function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold text-slate-100">{title}</h1>
      <p className="text-sm text-slate-400 mt-2">{description}</p>
      <div className="mt-8 bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
        <p className="text-slate-300 font-medium">Coming in next phase</p>
        <p className="text-slate-500 text-sm mt-1">
          Foundation (roster + releases) sẵn sàng. Tab này sẽ được implement sau khi data có sẵn.
        </p>
      </div>
    </div>
  );
}
