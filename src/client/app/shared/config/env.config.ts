// Feel free to extend this interface
// depending on your app specific config.
export interface EnvConfig {
  API?: string;
  ENV?: string;
  VERSION?: string | number;
}

export const Config: EnvConfig = JSON.parse('<%= ENV_CONFIG %>');

