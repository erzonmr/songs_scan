export type Song = {
  id: string;
  title: string;
  content: string;
  favorite: boolean;
  category: string;
  createdAt: number;
  updatedAt: number;
  version: number;
};
export type Photo = {
  id: string;
  dataUrl: string;
  name: string;
  crop: Crop;
  rotation: number;
};
export type Crop = { x: number; y: number; width: number; height: number };
