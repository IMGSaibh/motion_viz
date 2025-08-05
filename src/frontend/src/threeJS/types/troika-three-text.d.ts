declare module 'troika-three-text' {
  export class Text extends THREE.Mesh {
    text: string;
    font: string;
    fontSize: number;
    color: THREE.ColorRepresentation;
    anchorX: string;
    anchorY: string;
    sync: () => void;
    [key: string]: any;
  }
}
