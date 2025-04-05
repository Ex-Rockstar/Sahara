declare module 'expo-av' {
  export class Audio {
    static Sound: {
      createAsync(
        source: any,
        options?: { shouldPlay?: boolean }
      ): Promise<{ sound: Audio.Sound }>;
    };
  }

  export namespace Audio {
    export interface Sound {
      playAsync(): Promise<void>;
      pauseAsync(): Promise<void>;
      stopAsync(): Promise<void>;
      unloadAsync(): Promise<void>;
    }

    export interface SoundOptions {
      shouldPlay?: boolean;
      volume?: number;
      rate?: number;
      shouldCorrectPitch?: boolean;
    }

    export function createAsync(
      source: any,
      options?: SoundOptions
    ): Promise<{ sound: Sound }>;
  }
} 