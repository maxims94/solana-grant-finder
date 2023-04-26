export interface Grant {
  id: string;
  name: string;
  icon_path: string | null;
  description: string;
  is_rfp: boolean;
  link: string;
  document: string;
  org_name: string;
  org_link: string;

  embedding: number[] | null
}