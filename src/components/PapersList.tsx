import { useEffect, useState } from "react";

interface ImplementationUrl {
  identifier: string;
  type: string;
  paper_frequency: number;
  extraction_methods: {
    type: string;
    location: string;
    location_type: string;
    source: string;
    source_paragraph: string;
  }[];
}

interface Paper {
  title: string;
  implementation_urls: ImplementationUrl[];
  doi: string;
  arxiv: string | null;
  abstract: string;
  publication_date: string;
  authors: string;
  pdf_link: string;
  file_name?: string;
  file_path?: string;
}

const PapersList = () => {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [expandedYear, setExpandedYear] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + 'papers.json')
      .then((response) => response.json())
      .then((data) => setPapers(data))
      .catch((error) => console.error("Error loading JSON:", error));
  }, []);

  // Group papers by year
  const papersByYear: Record<number, Paper[]> = papers.reduce((acc, paper) => {
    const year = paper.publication_date ? parseInt(paper.publication_date.split("-")[0], 10) : -1;
    if (!acc[year]) acc[year] = [];
    acc[year].push(paper);
    return acc;
  }, {} as Record<number, Paper[]>);

  // Sort papers within each year
  Object.keys(papersByYear).forEach((year) => {
    papersByYear[parseInt(year)].sort((a, b) => new Date(a.publication_date).getTime() - new Date(b.publication_date).getTime());
  });

  // Filter papers by search query
const filteredPapers = searchQuery.trim()
  ? papers.filter((paper) => {
      const queryLower = searchQuery.toLowerCase();
      const title = paper.title ?? "";
      const authorsArray = Array.isArray(paper.authors)
        ? paper.authors
        : (paper.authors ?? "")
            .split(",")
            .map((author) => author.trim());

      return (
        title.toLowerCase().includes(queryLower) ||
        authorsArray.some((author) => author.toLowerCase().includes(queryLower))
      );
    })
  : papers;

  // Group filtered papers by year
  const filteredPapersByYear: Record<number, Paper[]> = filteredPapers.reduce((acc, paper) => {
    const year = paper.publication_date ? parseInt(paper.publication_date.split("-")[0], 10) : -1;
    if (!acc[year]) acc[year] = [];
    acc[year].push(paper);
    return acc;
  }, {} as Record<number, Paper[]>);

  // Sort filtered papers within each year
  Object.keys(filteredPapersByYear).forEach((year) => {
    filteredPapersByYear[parseInt(year)].sort((a, b) => new Date(a.publication_date).getTime() - new Date(b.publication_date).getTime());
  });

  // Clear search input
  const clearSearch = () => setSearchQuery("");

  return (
    <div className="bg-background min-h-screen p-6">
      <h1 className="text-4xl font-bold text-center text-primary mb-8">Research Papers</h1>

      {/* Search bar */}
      <div className="mb-8 text-center relative w-full md:w-1/2 mx-auto">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by title or author..."
          className="px-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary pr-10" // Added pr-10 for space
        />
        {/* Clear Search button */}
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-primary"
          >
            &#10005;
          </button>
        )}
      </div>

      {/* Display papers grouped by year */}
      {Object.keys(filteredPapersByYear).map((year) => {
        const papersInYear = filteredPapersByYear[parseInt(year)];

        return (
          <div key={year} className="mb-6">
            <button
              onClick={() => setExpandedYear(expandedYear === parseInt(year) ? null : parseInt(year))}
              className="w-full text-left p-4 bg-card text-primary rounded-lg shadow-md hover:bg-primary hover:text-white transition duration-300 ease-in-out"
            >
              {year}
            </button>
            {expandedYear === parseInt(year) && (
              <ul className="mt-4 space-y-4">
                {papersInYear.map((paper, index) => (
                  <li key={index} className="p-6 border border-gray-200 rounded-xl bg-white shadow-lg hover:shadow-2xl transition duration-300">
                    <h2 className="text-2xl font-semibold text-text">{paper.title}</h2>
                    <p className="text-sm text-gray-500">
                      <strong>Authors:</strong> {paper.authors}
                    </p>
                    <p className="text-sm text-gray-500">
                      <strong>Published on:</strong> {paper.publication_date}
                    </p>
                    <div className="mt-4">
                      {paper.pdf_link && paper.pdf_link.trim() !== '' && (
                        <a
                          href={paper.pdf_link}
                          target="_blank"
                          className="text-secondary hover:text-primary transition duration-300"
                        >
                          📄 Paper PDF
                        </a>
                      )}
                      {paper.implementation_urls && paper.implementation_urls.length > 0 && (
                        <div className="relative inline-block ml-4">
                          <details className="inline-block">
                            <summary className="cursor-pointer text-secondary hover:text-primary transition duration-300">
                              📦 Artifacts
                            </summary>
                            <ul className="absolute z-10 mt-2 bg-white border border-gray-200 rounded-md shadow-lg p-2 space-y-1">
                              {paper.implementation_urls.map((impl, i) => (
                                <li key={i}>
                                  <a
                                    href={impl.identifier}
                                    target="_blank"
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded whitespace-nowrap min-w-[120px]"
                                  >
                                    {impl.type.toUpperCase() === 'GIT' ? '💻 GIT' : impl.type.toUpperCase() === 'ZENODO' ? '📘 ZENODO' : impl.type.toUpperCase()}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </details>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PapersList;
