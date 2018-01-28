export interface Buildable {
  _buildable?: boolean;
  build(): string;
}
