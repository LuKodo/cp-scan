export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface SignaturePath {
  readonly d: string;
  readonly timestamp: number;
}

export interface SignatureData {
  readonly paths: readonly string[];
  readonly width: number;
  readonly height: number;
  readonly createdAt: string;
}
