import { Maybe } from "../../../shared/types";

export type Vector = number[];

export interface SimilarVectorResult {
  vector: Vector;
  label: string;
}

export interface VectorStore {
  getSimilarVector(vector: Vector): Maybe<SimilarVectorResult>;
  setVector(vector: Vector, label: string): void;
  size(): number;
}
