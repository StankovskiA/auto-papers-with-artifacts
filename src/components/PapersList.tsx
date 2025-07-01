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

  // Helper function to process and sort papers
  const processPapers = (papersToProcess: Paper[]) => {
    // Filter out papers with year -1 from the initial set
    const validPapers = papersToProcess.filter(paper => {
      const year = paper.publication_date ? parseInt(paper.publication_date.split("-")[0], 10) : -1;
      return year !== -1;
    });

    // Sort by publication date, most recent first
    return validPapers.sort((a, b) => new Date(b.publication_date).getTime() - new Date(a.publication_date).getTime());
  };

  // Filter papers by search query
  const filteredAndSortedPapers = searchQuery.trim()
    ? processPapers( // Apply sorting directly if there's a search query
        papers.filter((paper) => {
          const queryLower = searchQuery.toLowerCase();
          const title = paper.title ?? "";
          // Ensure authors is an array before processing
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
      )
    : [];

  // Group papers by year for the default view (when no search query)
  const papersByYear: Record<number, Paper[]> = papers.reduce((acc, paper) => {
    const year = paper.publication_date ? parseInt(paper.publication_date.split("-")[0], 10) : -1;
    if (year !== -1) { // Exclude papers with year -1
      if (!acc[year]) acc[year] = [];
      acc[year].push(paper);
    }
    return acc;
  }, {} as Record<number, Paper[]>);

  // Sort papers within each year for the default view
  Object.keys(papersByYear).forEach((year) => {
    papersByYear[parseInt(year)].sort((a, b) => new Date(a.publication_date).getTime() - new Date(b.publication_date).getTime());
  });


  // Clear search input
  const clearSearch = () => setSearchQuery("");

  const renderPaperCard = (paper: Paper, index: number) => (
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
            rel="noopener noreferrer"
            className="text-secondary hover:text-primary transition duration-300"
          >
            📄 Paper PDF
          </a>
        )}

        {/* Artifacts Display Logic */}
        {paper.implementation_urls && paper.implementation_urls.length > 0 && (
          <>
            {paper.implementation_urls.length === 1 ? (
              // Display single artifact directly
              <a
                href={paper.implementation_urls[0].identifier}
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary hover:text-primary transition duration-300 ml-4"
              >
                {paper.implementation_urls[0].type.toUpperCase() === 'GIT' ? '💻 GIT' : paper.implementation_urls[0].type.toUpperCase() === 'ZENODO' ? '📘 ZENODO' : `📦 Artifact (${paper.implementation_urls[0].type.toUpperCase()})`}
              </a>
            ) : (
              // Display artifacts as a list
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
                          rel="noopener noreferrer"
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
          </>
        )}
      </div>
    </li>
  );

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
          className="px-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary pr-10"
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

      {/* Conditional rendering based on search query */}
      {searchQuery.trim() ? (
        // Display flat list if search query is active
        <div className="mt-4 space-y-4">
          {filteredAndSortedPapers.length > 0 ? (
            <ul className="space-y-4">
              {filteredAndSortedPapers.map((paper, index) => renderPaperCard(paper, index))}
            </ul>
          ) : (
            <p className="text-center text-gray-600">No papers found matching your search.</p>
          )}
        </div>
      ) : (
        // Display grouped by year if no search query
        Object.keys(papersByYear)
          .sort((a, b) => parseInt(b) - parseInt(a)) // Sort years from recent to old
          .map((year) => {
            const papersInYear = papersByYear[parseInt(year)];

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
                    {papersInYear.map((paper, index) => renderPaperCard(paper, index))}
                  </ul>
                )}
              </div>
            );
          })
      )}
    </div>
  );
};

export default PapersList;