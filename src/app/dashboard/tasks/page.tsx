export default function TasksSuggesterPage() {
  const interests = ["Python", "Data Science", "Creative Writing"];
  const suggestions = [
    { title: "Python Loops — 15 min video", link: "https://youtu.be/b4v7XU2QkH8" },
    { title: "DSA Practice — 3 array problems", link: "https://leetcode.com" },
    { title: "Career: DS Roadmap — short read", link: "https://roadmap.sh/ai-data-scientist" }
  ];
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Suggested Tasks for Free Periods</h1>
      <div className="text-sm text-gray-600">Interests: {interests.join(", ")}</div>
      <div className="space-y-3">
        {suggestions.map((s) => (
          <a key={s.title} href={s.link} target="_blank" className="block border rounded-md p-3 hover:bg-gray-50 no-underline text-indigo-700">
            {s.title}
          </a>
        ))}
      </div>
    </div>
  );
}



