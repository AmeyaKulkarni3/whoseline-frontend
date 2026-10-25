import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

export interface GameResponse {
  id: number;
  code: string;
  status: string;
  ownerUserId: number;
  players: GamePlayer[];
  storyName: string;
}

export interface GamePlayer {
  userId: number;
  displayName: string;
  avatarUrl: string | null;
  joinedAt: string;
}

export interface ActiveGameResponse {
  id: number;
  code: string;
  status: string;
}

export interface GameSentenceResponse {
  userId: number;
  displayName: string;
  text: string;
  sequence: number;
  submittedAt: string;
  roundNumber: number;
}

export interface GamePlayResponse {
  code: string;
  status: string;
  currentRound: number | null;
  totalRounds: number;
  maxSentenceLength: number;
  currentTurnUserId: number | null;
  sentences: GameSentenceResponse[];
  players: GamePlayer[];
}

export interface PastGameResponse {
  id: number;
  code: string;
  status: string;
  storyName: string | null;
  participantCount: number;
  totalRounds: number;
  createdAt: string | null;
  completedAt: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class Game {
  // private readonly baseUrl = 'http://localhost:8082/api/games';

  private readonly baseUrl = 'http://localhost:8080/api/games';

  private readonly http = inject(HttpClient);

  createGame() {
    return this.http.post<GameResponse>(this.baseUrl, {});
  }

  getGame(code: string) {
    return this.http.get<GameResponse>(`${this.baseUrl}/${code}`);
  }

  getMyActiveGame() {
    return this.http.get<ActiveGameResponse>(`${this.baseUrl}/my-active`);
  }

  joinGame(code: string) {
    return this.http.post<void>(`${this.baseUrl}/${code}/join`, {});
  }

  leaveGame(code: string) {
    return this.http.delete<void>(`${this.baseUrl}/${code}/players/me`);
  }

  endGame(code: string) {
    return this.http.post<void>(`${this.baseUrl}/${code}/end`, {});
  }

  startGame(code: string) {
    return this.http.post<void>(`${this.baseUrl}/${code}/start`, {});
  }

  getGamePlay(code: string) {
    return this.http.get<GamePlayResponse>(`${this.baseUrl}/${code}/play`);
  }

  submitSentence(code: string, text: string) {
    return this.http.post<void>(`${this.baseUrl}/${code}/sentences`, { text });
  }

  updateStoryName(code: string, storyName: string) {
    return this.http.patch<void>(`${this.baseUrl}/${code}/story-name`, { storyName });
  }

  getPastGames() {
    return this.http.get<PastGameResponse[]>(`${this.baseUrl}/my-past`);
  }
}
