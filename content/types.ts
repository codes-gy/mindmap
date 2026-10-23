export type TabKey = 'spring' | 'cs' | 'net' | 'ds' | 'algo';

export interface Compare {
  cols: string[];
  rows: string[][];
}

export interface Concept {
  /** 진도 기록과 주소에 쓰는 고정 id: `${tab}/${slug}` */
  id: string;
  slug: string;
  title: string;
  deep: boolean;
  /** 한 문장 정의 */
  def: string;
  why?: string;
  /** 설명 문단. `- 라벨: 내용`은 목록, `1) ...`은 단계로 그린다 */
  how?: string[];
  flow?: string[];
  code?: string;
  codeLang?: 'java' | 'sql' | 'yaml' | 'sh';
  use?: string[];
  warn?: string[];
  myth?: [string, string][];
  /** 30초 답변 */
  answer?: string;
  analogy?: string;
  qa?: [string, string];
  followUps?: [string, string][];
  /** 관련 개념 id. 다른 탭의 개념도 가리킬 수 있다 */
  related?: string[];
}

export interface Group {
  name: string;
  compare?: Compare;
  concepts: Concept[];
}

export interface Topic {
  /** 파일 이름과 같은 고정 키: `net-0` */
  key: string;
  name: string;
  groups: Group[];
  must: string[];
}

export interface Tab {
  key: TabKey;
  title: string;
  root: string;
  topics: Topic[];
}
