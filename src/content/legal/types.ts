export type LegalSection = {
  id: string;
  title: string;
  paragraphs?: string[];
  list?: string[];
};

export type LegalDocument = {
  title: string;
  subtitle: string;
  updatedAt: string;
  sections: LegalSection[];
};
