import type { Topic } from '../types';

const topic: Topic = {
  key: "cs-5",
  name: "데이터베이스",
  must: [
    "인덱스 컬럼에 함수나 형 변환을 걸거나 `LIKE '%검색어'`처럼 앞에 %를 쓰면 인덱스를 타지 못한다.",
    "쿼리가 느리면 `EXPLAIN`으로 실행 계획부터 확인한다.",
    "OFFSET 페이징은 뒤로 갈수록 느려진다. 마지막 id 기준으로 조회하는 커서(no-offset) 방식을 쓴다.",
    "레플리케이션은 읽기를 분산하고 샤딩은 쓰기를 분산한다. 레플리카는 복제 지연이 있다."
  ],
  groups: [
    {
      name: "인덱스",
      compare: {
        cols: ["기준", "클러스터드 인덱스", "세컨더리 인덱스", "커버링 인덱스"],
        rows: [
          ["리프에 담긴 것", "행 데이터 전체", "컬럼 값 + PK", "쿼리에 필요한 컬럼 전부"],
          ["테이블당 개수", "1개(PK)", "여러 개", "쿼리에 따라 다름"],
          ["조회 단계", "한 번에 행 읽기", "인덱스 → PK로 재조회", "인덱스만 읽고 끝"],
          ["실행 계획 표시", "key=PRIMARY", "key=인덱스 이름", "Extra: Using index"]
        ]
      },
      concepts: [
        {
          id: "cs/indekseu",
          slug: "indekseu",
          title: "인덱스",
          deep: true,
          def: "테이블의 특정 컬럼 값과 그 행의 위치를 정렬해서 따로 저장해 둔 자료구조로, 책의 색인과 같다.",
          why: "인덱스가 없으면 조건에 맞는 행을 찾으려고 테이블 전체를 읽는 풀 테이블 스캔을 해야 한다. 데이터가 수백만 건이면 쿼리 하나에 수 초가 걸리고, 인덱스가 있으면 몇 번의 페이지 읽기로 끝난다.",
          how: [
            "대부분의 RDB는 인덱스를 B+Tree로 만든다. 컬럼 값이 정렬되어 있으므로 원하는 값을 O(log n)으로 찾고, 범위 조건과 정렬에도 쓸 수 있다.",
            "- 인덱스가 쓰이는 곳: WHERE 조건, JOIN 조건, ORDER BY와 GROUP BY(이미 정렬되어 있어 정렬 작업 생략), MIN/MAX.",
            "- 비용: INSERT, UPDATE, DELETE 때마다 인덱스도 함께 갱신해야 해 쓰기가 느려지고 저장 공간을 차지한다.",
            "- 카디널리티(값의 종류 수)가 높은 컬럼일수록 효과가 크다. 성별처럼 값이 두세 개뿐이면 인덱스로 걸러지는 행이 적어 옵티마이저가 풀 스캔을 택하기도 한다.",
            "- 조회 결과가 테이블의 상당 부분(대략 20~25% 이상)이면 인덱스를 거쳐 행을 하나씩 찾아가는 것보다 풀 스캔이 빠를 수 있다.",
            "인덱스는 \"많을수록 좋다\"가 아니라 실제 조회 패턴을 보고 꼭 필요한 것만 만든다."
          ],
          flow: ["WHERE 조건 확인", "옵티마이저가 인덱스 선택", "B+Tree에서 키 탐색", "행 위치로 데이터 읽기"],
          code: "-- 인덱스 생성\nCREATE INDEX idx_orders_member_id ON orders (member_id);\n\n-- 인덱스를 타는 조회\nSELECT * FROM orders WHERE member_id = 42;\n\n-- 실행 계획으로 확인 (type=ref, key=idx_orders_member_id 이면 인덱스 사용)\nEXPLAIN SELECT * FROM orders WHERE member_id = 42;",
          codeLang: "sql",
          use: [
            "슬로우 쿼리 로그에서 찾은 느린 조회에 인덱스를 추가해 응답을 수 초에서 수 밀리초로 줄인다.",
            "외래 키 컬럼(`member_id`)에 인덱스를 둬 조인과 연관 조회를 빠르게 한다.",
            "쓰기가 매우 많은 로그 테이블은 인덱스를 최소화한다."
          ],
          warn: [
            "인덱스 컬럼을 가공하면 인덱스를 타지 못한다: `WHERE DATE(created_at) = '2026-10-23'` 대신 `created_at >= '2026-10-23' AND created_at < '2026-10-24'`.",
            "`LIKE '%검색어'`처럼 앞에 %가 오면 정렬 순서를 쓸 수 없어 인덱스를 타지 못한다. `LIKE '검색어%'`는 탈 수 있다.",
            "컬럼 타입과 다른 값으로 비교하면(문자열 컬럼에 숫자 비교) 형 변환이 일어나 인덱스를 못 탈 수 있다."
          ],
          myth: [
            [
              "인덱스를 만들면 항상 사용된다.",
              "옵티마이저가 비용을 계산해 풀 스캔이 더 싸다고 판단하면 쓰지 않습니다. 조건 컬럼을 가공하거나 형 변환이 일어나도 쓰이지 않습니다."
            ]
          ],
          answer: "인덱스는 컬럼 값과 행 위치를 정렬해 따로 저장한 자료구조로, 풀 테이블 스캔 대신 B+Tree로 빠르게 찾게 해 줍니다. WHERE, JOIN, ORDER BY에 쓰이지만 쓰기마다 함께 갱신되어 쓰기가 느려지고 공간을 차지합니다. 그래서 카디널리티가 높고 자주 조회되는 컬럼에 필요한 만큼만 만듭니다.",
          analogy: "두꺼운 책 뒤의 색인과 같습니다. 단어를 찾으려고 책 전체를 넘기지 않고 색인에서 페이지 번호를 바로 찾습니다.",
          qa: [
            "인덱스를 많이 만들면 어떤 문제가 생기나요?",
            "인덱스는 조회를 빠르게 하지만, 데이터가 바뀔 때마다 모든 인덱스를 함께 갱신해야 해서 INSERT, UPDATE, DELETE가 느려지고 저장 공간도 늘어납니다. 또 인덱스가 많으면 옵티마이저가 잘못된 인덱스를 고를 가능성도 생깁니다. 그래서 실제 쿼리 패턴과 실행 계획을 보고 카디널리티가 높고 자주 조회되는 컬럼 위주로 필요한 인덱스만 만듭니다."
          ],
          followUps: [
            [
              "카디널리티가 낮은 컬럼에 인덱스를 만들면 어떤가요?",
              "성별처럼 값 종류가 적으면 인덱스로 걸러지는 행이 많지 않아 인덱스를 거쳐 행을 찾아가는 비용이 오히려 큽니다. 그래서 옵티마이저가 풀 스캔을 택하는 경우가 많고, 다른 컬럼과 복합 인덱스로 묶을 때 의미가 생깁니다."
            ],
            [
              "인덱스가 있는데도 느리다면 무엇을 확인하나요?",
              "EXPLAIN으로 실제로 그 인덱스를 쓰는지, type과 rows가 어떤지 봅니다. 컬럼 가공이나 앞쪽 % LIKE로 인덱스를 못 타는지, 결과 행이 너무 많아 PK 재조회가 많은지, 통계 정보가 오래됐는지 확인합니다."
            ],
            [
              "인덱스는 쓰기 성능에 얼마나 영향을 주나요?",
              "행 하나를 INSERT하면 모든 인덱스의 B+Tree에도 항목을 추가해야 하므로 인덱스 수에 비례해 쓰기 비용이 늘어납니다. 중간 삽입으로 페이지 분할이 생기면 더 느려집니다."
            ]
          ],
          related: ["cs/bplustree-indekseu", "cs/bokhap-indekseu", "cs/silhaeng-gyehoek-explain"]
        },
        {
          id: "cs/bplustree-indekseu",
          slug: "bplustree-indekseu",
          title: "B+Tree 인덱스",
          deep: false,
          def: "키를 정렬된 상태로 보관하는 균형 다진 트리로, 대부분의 RDB 인덱스가 이 구조를 쓴다.",
          why: "디스크 읽기 횟수를 적게 유지하면서 등호 검색과 범위 검색, 정렬을 모두 빠르게 처리하기 위해서다.",
          how: [
            "노드 하나를 디스크 페이지(InnoDB는 16KB) 크기로 만들어 노드마다 수백 개의 키를 담는다. 그래서 수천만 건도 트리 높이 3~4, 즉 디스크 읽기 3~4번으로 찾는다.",
            "- 루트·브랜치 노드는 길 안내용 키만 가지고, 실제 값(또는 행 위치)은 리프 노드에만 있다.",
            "- 리프 노드끼리 연결 리스트로 이어져 있어 `BETWEEN`, `>`, `ORDER BY` 같은 범위 조회를 리프만 따라가며 처리한다.",
            "- 모든 리프가 같은 깊이에 있어 어떤 값을 찾든 비용이 일정하다.",
            "해시 인덱스는 등호 검색이 O(1)이지만 범위 검색과 정렬을 못 해서 범용 인덱스로는 B+Tree를 쓴다."
          ],
          flow: ["루트에서 키 범위 비교", "브랜치 노드로 내려감", "리프 노드 도착", "범위면 리프 링크로 이동"],
          use: ["`created_at` 범위 조회와 정렬을 인덱스 하나로 처리한다."],
          answer: "B+Tree는 노드 하나에 수백 개의 키를 담는 균형 트리로, 데이터는 리프에만 두고 리프끼리 연결합니다. 높이가 3~4 정도라 디스크 읽기 몇 번으로 찾고, 리프 연결 덕분에 범위 조회와 정렬에도 강해 대부분의 DB 인덱스로 쓰입니다.",
          analogy: "아파트 동 → 층 → 호수 순서로 찾아가는 안내판과 같습니다. 같은 층의 집들은 복도로 이어져 옆집으로 바로 갈 수 있습니다.",
          followUps: [
            [
              "해시 인덱스 대신 B+Tree를 쓰는 이유는?",
              "해시는 등호 검색이 O(1)로 빠르지만 값의 순서를 잃어 범위 검색, 정렬, 앞부분 일치 검색을 못 합니다. B+Tree는 등호와 범위 모두 로그 시간에 처리해 범용으로 적합합니다."
            ]
          ],
          related: ["cs/indekseu", "cs/keulreoseuteodeu-indekseu"]
        },
        {
          id: "cs/keulreoseuteodeu-indekseu",
          slug: "keulreoseuteodeu-indekseu",
          title: "클러스터드 인덱스",
          deep: false,
          def: "테이블 데이터 자체가 인덱스 키 순서대로 정렬되어 저장되는 인덱스다.",
          why: "PK 순서대로 행을 물리적으로 저장해, PK 기반 조회와 범위 검색을 추가 이동 없이 처리하기 위해서다.",
          how: [
            "InnoDB에서는 기본 키(PK)가 클러스터드 인덱스이고, B+Tree의 리프 노드에 행 데이터 전체가 들어 있다. 테이블당 하나만 있을 수 있다.",
            "- PK로 조회하거나 PK 범위를 조회하면 리프에서 바로 데이터를 읽어 가장 빠르다.",
            "- PK를 기준으로 물리적으로 정렬되므로 무작위 값(UUID v4)을 PK로 쓰면 삽입할 때마다 중간에 끼워 넣느라 페이지 분할이 자주 일어나 쓰기 성능이 떨어진다. 자동 증가 값이나 시간 순서 UUID(v7)가 유리하다.",
            "- PK를 명시하지 않으면 InnoDB가 유니크 NOT NULL 컬럼이나 숨겨진 행 ID로 만든다."
          ],
          use: ["PK를 자동 증가 값으로 두어 새 행이 항상 끝에 붙게 해 페이지 분할을 줄인다.", "UUID가 필요하면 시간 순서가 있는 UUID v7을 PK로 쓴다."],
          myth: [
            [
              "PK를 UUID로 쓰면 성능에 문제가 없다.",
              "무작위 UUID v4는 삽입 위치가 흩어져 페이지 분할과 캐시 미스가 늘고, 16바이트라 모든 세컨더리 인덱스도 커집니다."
            ]
          ],
          answer: "클러스터드 인덱스는 테이블 데이터 자체가 키 순서대로 저장되는 인덱스로, InnoDB에서는 PK가 클러스터드 인덱스입니다. PK 조회와 PK 범위 조회가 가장 빠르고, 테이블당 하나만 존재합니다.",
          analogy: "번호순으로 꽂힌 사물함과 같습니다. 번호만 알면 바로 물건을 꺼낼 수 있습니다.",
          followUps: [
            [
              "PK 크기가 성능에 영향을 주는 이유는?",
              "InnoDB의 세컨더리 인덱스는 리프에 PK를 저장하므로 PK가 크면 모든 세컨더리 인덱스가 함께 커집니다. 인덱스가 커지면 메모리에 덜 들어가 디스크 읽기가 늘어납니다."
            ]
          ],
          related: ["cs/sekeondeori-indekseu", "cs/bplustree-indekseu"]
        },
        {
          id: "cs/sekeondeori-indekseu",
          slug: "sekeondeori-indekseu",
          title: "세컨더리 인덱스",
          deep: false,
          def: "클러스터드 인덱스 외에 추가로 만드는 인덱스로, 리프 노드에 인덱스 컬럼 값과 PK를 저장한다.",
          why: "PK가 아닌 컬럼으로 검색할 때도 풀 테이블 스캔 없이 원하는 행을 빠르게 찾기 위해서다.",
          how: [
            "`member_id`에 세컨더리 인덱스가 있으면 조회는 두 단계로 진행된다.",
            "1) 세컨더리 인덱스에서 `member_id = 42`인 항목들의 PK를 찾는다.",
            "2) 그 PK로 클러스터드 인덱스를 다시 찾아가 행 전체를 읽는다.",
            "2단계 때문에 결과가 많으면 PK 조회가 많이 반복되어 느려진다. 필요한 컬럼이 모두 인덱스에 있으면 2단계를 생략할 수 있다(커버링 인덱스).",
            "PK가 모든 세컨더리 인덱스에 복사되므로 PK가 크면(긴 문자열) 모든 인덱스가 커진다."
          ],
          flow: ["세컨더리 인덱스에서 값 탐색", "리프에서 PK 얻기", "PK로 클러스터드 인덱스 탐색", "행 데이터 읽기"],
          use: ["이메일 로그인 조회를 위해 `email`에 유니크 세컨더리 인덱스를 만든다."],
          answer: "세컨더리 인덱스는 PK 외에 만드는 인덱스로, 리프에 인덱스 컬럼 값과 PK를 저장합니다. 그래서 인덱스로 PK를 찾은 뒤 클러스터드 인덱스를 한 번 더 찾아 행을 읽습니다.",
          followUps: [
            [
              "세컨더리 인덱스 조회 결과가 많으면 왜 느려지나요?",
              "찾은 PK마다 클러스터드 인덱스를 다시 찾아가야 해서 무작위 읽기가 행 수만큼 반복됩니다. 결과가 많으면 옵티마이저가 풀 스캔을 택하거나, 커버링 인덱스로 재조회를 없애야 합니다."
            ]
          ],
          related: ["cs/keulreoseuteodeu-indekseu", "cs/keobeoring-indekseu"]
        },
        {
          id: "cs/bokhap-indekseu",
          slug: "bokhap-indekseu",
          title: "복합 인덱스",
          deep: true,
          def: "두 개 이상의 컬럼을 묶어 하나로 만든 인덱스로, 컬럼 순서대로 정렬된다.",
          why: "실제 쿼리는 `WHERE member_id = ? AND status = ? ORDER BY created_at`처럼 여러 조건을 함께 쓴다. 컬럼마다 따로 인덱스를 만들면 DB는 보통 하나만 고르므로, 함께 쓰는 컬럼을 묶어야 한 번에 좁힐 수 있다.",
          how: [
            "`(a, b, c)` 인덱스는 a로 먼저 정렬하고, a가 같으면 b로, b까지 같으면 c로 정렬한다. 전화번호부가 성 → 이름 순으로 정렬된 것과 같다.",
            "- 선두 컬럼 원칙: a, (a, b), (a, b, c) 조건에는 쓰이지만 b나 c만으로는 쓰이지 않는다. 이름만 알고 성을 모르면 전화번호부를 처음부터 봐야 하는 것과 같다.",
            "- 범위 조건 이후 컬럼: `a = 1 AND b > 10 AND c = 5`에서 b가 범위 조건이면 c는 인덱스로 좁히지 못하고 걸러내기만 한다. 그래서 등호(=) 조건 컬럼을 앞에, 범위 조건 컬럼을 뒤에 둔다.",
            "- 정렬 활용: `WHERE a = 1 ORDER BY b`는 이미 b 순서로 정렬되어 있어 별도 정렬(filesort)이 필요 없다.",
            "- 컬럼 순서는 \"어떤 조건이 항상 들어오는가\"와 \"얼마나 잘 걸러내는가(카디널리티)\"를 함께 보고 정한다."
          ],
          flow: ["선두 컬럼 등호로 범위 좁힘", "다음 컬럼으로 더 좁힘", "범위 조건 컬럼에서 멈춤", "이후 컬럼은 필터링만"],
          code: "CREATE INDEX idx_orders_member_status_created\n    ON orders (member_id, status, created_at);\n\n-- 인덱스 사용 O: 선두 컬럼부터 차례로 사용, 정렬도 인덱스로 처리\nSELECT * FROM orders\n WHERE member_id = 42 AND status = 'PAID'\n ORDER BY created_at DESC;\n\n-- 인덱스 사용 X(또는 비효율): 선두 컬럼 member_id가 빠짐\nSELECT * FROM orders WHERE status = 'PAID';",
          codeLang: "sql",
          use: [
            "`WHERE member_id = ? AND status = ? ORDER BY created_at DESC`에 `(member_id, status, created_at)` 인덱스를 만들어 정렬까지 인덱스로 처리한다.",
            "`(a)` 인덱스와 `(a, b)` 인덱스가 함께 있으면 `(a)`를 지워 쓰기 비용을 줄인다."
          ],
          warn: [
            "`(a, b)` 인덱스가 있으면 `(a)` 단독 인덱스는 대부분 중복이다. 쓰기 비용만 늘리므로 정리한다.",
            "MySQL 8.0의 인덱스 스킵 스캔처럼 선두 컬럼이 없어도 쓰이는 경우가 있지만, 선두 컬럼 카디널리티가 낮을 때만 효과가 있어 기대하지 않는 것이 안전하다."
          ],
          myth: [
            [
              "WHERE 절의 컬럼 순서를 인덱스 순서와 똑같이 써야 한다.",
              "WHERE 절에 적는 순서는 상관없습니다. 옵티마이저가 알아서 맞춥니다. 중요한 것은 어떤 컬럼이 조건에 포함되는지입니다."
            ]
          ],
          answer: "복합 인덱스는 여러 컬럼을 묶은 인덱스로, 첫 컬럼부터 순서대로 정렬됩니다. 선두 컬럼이 조건에 없으면 제대로 쓰이지 않고, 범위 조건 뒤의 컬럼은 범위를 좁히지 못합니다. 그래서 항상 쓰는 등호 조건 컬럼을 앞에, 범위·정렬 컬럼을 뒤에 둡니다.",
          analogy: "성 → 이름 순으로 정렬된 전화번호부와 같습니다. 성을 알면 빨리 찾지만 이름만 알면 처음부터 봐야 합니다.",
          qa: [
            "복합 인덱스의 컬럼 순서는 어떻게 정하나요?",
            "복합 인덱스는 첫 번째 컬럼부터 순서대로 정렬되므로 선두 컬럼이 조건에 없으면 인덱스를 제대로 쓰지 못합니다. 그래서 항상 조건에 들어오는 컬럼과 등호 조건 컬럼을 앞에, 범위 조건이나 정렬 컬럼을 뒤에 둡니다. 범위 조건 뒤에 오는 컬럼은 인덱스로 범위를 좁히지 못하기 때문입니다. 마지막으로 실행 계획으로 실제로 인덱스를 타는지 확인합니다."
          ],
          followUps: [
            [
              "카디널리티가 높은 컬럼을 무조건 앞에 두나요?",
              "일반적으로 잘 거르는 컬럼을 앞에 두면 좋지만, 그보다 먼저 \"항상 조건에 들어오는가\"와 \"등호인가 범위인가\"를 봅니다. 자주 빠지는 컬럼을 앞에 두면 그 쿼리들이 인덱스를 못 씁니다."
            ],
            [
              "`a = 1 ORDER BY b`와 `a > 1 ORDER BY b`는 어떻게 다른가요?",
              "`(a, b)` 인덱스에서 a가 등호면 a가 같은 구간 안에서 b가 이미 정렬되어 정렬이 필요 없습니다. a가 범위면 여러 a 값에 걸친 b는 정렬되어 있지 않아 추가 정렬(filesort)이 생깁니다."
            ]
          ],
          related: ["cs/indekseu", "cs/keobeoring-indekseu", "cs/silhaeng-gyehoek-explain"]
        },
        {
          id: "cs/keobeoring-indekseu",
          slug: "keobeoring-indekseu",
          title: "커버링 인덱스",
          deep: false,
          def: "쿼리에 필요한 모든 컬럼이 인덱스에 들어 있어, 테이블을 읽지 않고 인덱스만으로 결과를 만드는 경우다.",
          why: "세컨더리 인덱스로 찾은 뒤 실제 행을 읽으러 다시 클러스터드 인덱스를 뒤지는 랜덤 I/O를 없애기 위해서다.",
          how: [
            "`(member_id, status)` 인덱스에서 `SELECT status FROM orders WHERE member_id = 42`는 인덱스에 필요한 값이 다 있어 행 데이터를 찾아갈 필요가 없다. 세컨더리 인덱스 리프에는 PK도 있으므로 `SELECT id, status`도 커버링된다.",
            "- MySQL 실행 계획의 Extra에 `Using index`가 보이면 커버링 인덱스로 처리된 것이다.",
            "- 대용량 페이징에서 커버링 인덱스로 PK만 먼저 찾고, 그 PK로 필요한 행만 조인하는 최적화를 자주 쓴다.",
            "`SELECT *`는 거의 커버링되지 않으므로 필요한 컬럼만 조회하는 습관이 중요하다."
          ],
          use: [
            "대용량 페이징에서 커버링 인덱스로 PK 20개만 먼저 찾고, 그 PK로 행을 조인해 가져온다.",
            "목록 API가 `SELECT *` 대신 필요한 컬럼만 조회하게 바꿔 커버링되게 한다."
          ],
          answer: "커버링 인덱스는 쿼리에 필요한 컬럼이 모두 인덱스에 있어 테이블을 읽지 않고 인덱스만으로 결과를 만드는 경우입니다. PK 재조회가 없어 매우 빠르고, 실행 계획 Extra에 Using index로 표시됩니다.",
          analogy: "책을 펼치지 않고 목차만 보고 답할 수 있는 질문과 같습니다.",
          followUps: [
            [
              "커버링 인덱스를 위해 컬럼을 인덱스에 계속 추가하면 안 되나요?",
              "인덱스가 커질수록 쓰기 비용과 저장 공간이 늘고 메모리 효율이 떨어집니다. 자주 실행되고 느린 핵심 쿼리에만 선택적으로 적용합니다."
            ]
          ],
          related: ["cs/sekeondeori-indekseu", "cs/bokhap-indekseu", "cs/keoseo-giban-peijing"]
        },
        {
          id: "cs/silhaeng-gyehoek-explain",
          slug: "silhaeng-gyehoek-explain",
          title: "실행 계획 (EXPLAIN)",
          deep: false,
          def: "옵티마이저가 쿼리를 어떤 순서로, 어떤 인덱스를 써서 실행할지 보여 주는 정보다.",
          why: "인덱스를 만들어도 실제로 쓰이는지 알 수 없으므로, 느린 쿼리의 원인을 추측이 아닌 근거로 찾기 위해서다.",
          how: [
            "쿼리 앞에 `EXPLAIN`을 붙이면 실행하지 않고 계획만 보여 준다. MySQL 8.0의 `EXPLAIN ANALYZE`는 실제로 실행해 걸린 시간까지 보여 준다.",
            "- type: 접근 방식. `const`(PK·유니크 1건) > `ref`(인덱스 등호) > `range`(인덱스 범위) > `index`(인덱스 전체) > `ALL`(풀 테이블 스캔) 순으로 좋다.",
            "- key: 실제로 선택된 인덱스.",
            "- rows: 읽을 것으로 예상되는 행 수.",
            "- Extra: `Using index`(커버링), `Using where`, `Using filesort`(추가 정렬 필요), `Using temporary`(임시 테이블).",
            "느린 쿼리는 슬로우 쿼리 로그로 찾고 EXPLAIN으로 원인을 확인한다."
          ],
          use: ["새 쿼리를 배포하기 전에 EXPLAIN으로 인덱스 사용을 확인한다.", "JPA가 만든 SQL을 로그로 꺼내 EXPLAIN으로 N+1이나 풀 스캔을 찾는다."],
          myth: [["EXPLAIN의 rows는 실제로 읽은 행 수다.", "통계 기반 추정치입니다. 실제 값과 시간은 MySQL 8.0의 `EXPLAIN ANALYZE`로 확인합니다."]],
          answer: "EXPLAIN은 옵티마이저가 쿼리를 어떤 인덱스와 순서로 실행할지 보여 줍니다. type이 ALL이면 풀 스캔, key는 선택된 인덱스, rows는 예상 행 수, Extra의 Using filesort나 Using temporary는 추가 작업을 뜻합니다.",
          followUps: [
            [
              "type 값은 어떤 순서로 좋은가요?",
              "대략 const(PK·유니크 1건) > eq_ref > ref(인덱스 등호) > range(인덱스 범위) > index(인덱스 전체 스캔) > ALL(풀 테이블 스캔) 순입니다. ALL이나 index가 큰 테이블에서 보이면 개선 대상입니다."
            ]
          ],
          related: ["cs/indekseu", "cs/bokhap-indekseu"]
        }
      ]
    },
    {
      name: "트랜잭션 · ACID",
      compare: {
        cols: ["개념", "보장하는 것", "DB 구현 수단"],
        rows: [
          ["DB 트랜잭션", "작업을 하나의 단위로 처리", "`COMMIT`, `ROLLBACK`"],
          ["원자성", "전부 반영 또는 전부 취소", "언두 로그"],
          ["일관성", "제약 조건 항상 만족", "제약 조건, 트리거"],
          ["격리성", "중간 상태 노출 방지", "락, MVCC, 격리 수준"],
          ["지속성", "커밋 결과 영구 보존", "리두 로그, WAL"]
        ]
      },
      concepts: [
        {
          id: "cs/db-teuraenjaeksyeon",
          slug: "db-teuraenjaeksyeon",
          title: "DB 트랜잭션",
          deep: false,
          def: "더 이상 쪼갤 수 없는 작업의 논리적 단위로, 전부 반영되거나 전부 취소된다.",
          why: "여러 쿼리 중 일부만 반영되고 실패해 데이터가 어중간한 상태로 남는 것을 막기 위해서다.",
          how: [
            "계좌 이체의 \"A 출금\"과 \"B 입금\"은 둘 중 하나만 성공하면 돈이 사라지거나 생긴다. 둘을 하나의 트랜잭션으로 묶어 함께 커밋하거나 함께 롤백한다.",
            "- `BEGIN`(또는 `START TRANSACTION`)으로 시작하고 `COMMIT`으로 확정, `ROLLBACK`으로 취소한다.",
            "- 자동 커밋(autocommit) 모드에서는 SQL 하나하나가 각각 트랜잭션이다. JDBC의 `setAutoCommit(false)`가 트랜잭션 시작이다.",
            "- 트랜잭션이 락을 오래 잡을수록 다른 트랜잭션이 기다리므로 짧게 유지한다."
          ],
          flow: ["BEGIN으로 시작", "SQL 실행(락 획득)", "모두 성공하면 COMMIT", "실패하면 ROLLBACK", "락 해제"],
          code: "START TRANSACTION;\nUPDATE account SET balance = balance - 10000 WHERE id = 1;\nUPDATE account SET balance = balance + 10000 WHERE id = 2;\nCOMMIT;   -- 중간에 오류가 나면 ROLLBACK",
          codeLang: "sql",
          use: ["주문 생성, 재고 차감, 포인트 사용을 하나의 트랜잭션으로 묶는다.", "트랜잭션 안에서 외부 API 호출을 빼 락과 커넥션 점유 시간을 줄인다."],
          answer: "트랜잭션은 쪼갤 수 없는 작업 단위로, 안의 작업이 전부 반영되거나 전부 취소됩니다. 계좌 이체의 출금과 입금처럼 함께 성공해야 하는 작업을 묶고, COMMIT으로 확정하거나 ROLLBACK으로 취소합니다.",
          analogy: "은행 창구에서 이체 서류 한 장에 출금과 입금을 같이 적는 것과 같습니다. 서류가 처리되거나 통째로 반려됩니다.",
          followUps: [
            [
              "트랜잭션을 길게 잡으면 어떤 문제가 생기나요?",
              "그동안 잡은 락 때문에 다른 트랜잭션이 기다리고, 커넥션을 오래 점유해 풀이 고갈될 수 있습니다. MVCC의 undo 로그도 정리되지 못해 쌓입니다. 그래서 필요한 DB 작업만 짧게 묶습니다."
            ]
          ],
          related: ["cs/wonjaseong", "cs/gyeokriseong"]
        },
        {
          id: "cs/wonjaseong",
          slug: "wonjaseong",
          title: "원자성",
          deep: false,
          def: "트랜잭션의 작업이 모두 반영되거나 하나도 반영되지 않는 성질(Atomicity)이다.",
          why: "계좌 이체에서 출금만 되고 입금이 실패하는 것처럼 작업이 반쪽만 반영되는 것을 막기 위해서다.",
          how: [
            "중간에 오류가 나거나 서버가 죽으면 이미 실행한 변경까지 되돌린다.",
            "- InnoDB는 데이터를 바꾸기 전 값을 undo 로그에 기록해 두고, 롤백할 때 이 로그로 원래 값을 복원한다.",
            "- 같은 undo 로그가 MVCC의 이전 버전 읽기에도 쓰인다."
          ],
          use: ["이체 중간에 예외가 나면 롤백되어 출금만 반영되는 일이 없게 한다."],
          answer: "원자성은 트랜잭션의 작업이 모두 반영되거나 하나도 반영되지 않는 성질입니다. InnoDB는 변경 전 값을 undo 로그에 기록해 두고, 실패하면 이 로그로 원래 값을 되돌립니다.",
          analogy: "자판기에 돈을 넣었는데 음료가 안 나오면 돈이 그대로 돌아오는 것과 같습니다.",
          followUps: [
            [
              "원자성과 지속성은 각각 어떤 로그로 보장하나요?",
              "원자성은 변경 전 값을 담은 undo 로그로 롤백해 보장하고, 지속성은 변경 후 값을 담은 redo 로그를 커밋 전에 디스크에 기록해 장애 후 복구로 보장합니다."
            ]
          ],
          related: ["cs/db-teuraenjaeksyeon", "cs/jisokseong", "cs/mvcc"]
        },
        {
          id: "cs/ilgwanseong",
          slug: "ilgwanseong",
          title: "일관성",
          deep: false,
          def: "트랜잭션 전후로 데이터베이스가 정해진 규칙을 항상 만족하는 성질(Consistency)이다.",
          why: "트랜잭션이 끝난 뒤에도 제약 조건과 비즈니스 규칙이 깨지지 않은 올바른 상태를 보장하기 위해서다.",
          how: [
            "PK·FK·UNIQUE·NOT NULL·CHECK 제약 조건을 어기는 트랜잭션은 실패한다. \"잔액은 음수가 될 수 없다\", \"이체 전후 두 계좌 잔액의 합은 같다\" 같은 규칙도 포함된다.",
            "- DB 제약 조건이 지키는 부분과, 애플리케이션 로직이 지켜야 하는 업무 규칙이 함께 일관성을 만든다.",
            "- 나머지 세 성질(원자성, 격리성, 지속성)이 일관성을 지키는 수단이기도 하다."
          ],
          use: ["재고 컬럼에 `CHECK (stock >= 0)` 제약을 둬 음수 재고가 저장되지 않게 한다.", "중복 가입을 애플리케이션 검사만이 아니라 UNIQUE 제약으로도 막는다."],
          myth: [
            [
              "일관성은 DB가 알아서 보장한다.",
              "DB는 선언된 제약만 지킵니다. \"주문 금액은 상품 합계와 같다\" 같은 업무 규칙은 애플리케이션이 트랜잭션 안에서 지켜야 합니다."
            ]
          ],
          answer: "일관성은 트랜잭션 전후로 데이터베이스가 정해진 규칙을 항상 만족하는 성질입니다. PK, FK, UNIQUE, CHECK 같은 제약 조건과 애플리케이션의 업무 규칙이 함께 이를 지킵니다.",
          followUps: [
            [
              "애플리케이션에서 중복 검사를 했는데 왜 UNIQUE 제약도 필요한가요?",
              "두 요청이 동시에 \"없음\"을 확인하고 각각 INSERT하면 중복이 생깁니다. UNIQUE 제약은 DB가 원자적으로 막아 주므로 최종 방어선으로 꼭 둡니다."
            ]
          ],
          related: ["cs/db-teuraenjaeksyeon"]
        },
        {
          id: "cs/gyeokriseong",
          slug: "gyeokriseong",
          title: "격리성",
          deep: false,
          def: "동시에 실행되는 트랜잭션이 서로의 중간 상태를 보지 못하게 하는 성질(Isolation)이다.",
          why: "동시에 실행되는 트랜잭션이 서로의 중간 결과를 보거나 덮어써 데이터가 꼬이는 것을 막기 위해서다.",
          how: [
            "완벽하게 격리하면 트랜잭션을 하나씩 순서대로 실행하는 것과 같아져 동시성이 크게 떨어진다. 그래서 DB는 격리 수준을 두어 성능과 정확성 사이에서 고르게 한다.",
            "- 낮은 격리 수준일수록 Dirty Read, Non-Repeatable Read, Phantom Read 같은 이상 현상이 생길 수 있다.",
            "- 락과 MVCC가 격리성을 구현하는 수단이다."
          ],
          use: ["대부분 서비스는 기본 격리 수준을 쓰고, 정합성이 중요한 구간만 잠금 읽기로 보완한다."],
          answer: "격리성은 동시에 실행되는 트랜잭션이 서로의 중간 상태를 보지 못하게 하는 성질입니다. 완벽한 격리는 동시성을 크게 떨어뜨리므로 격리 수준으로 정확성과 성능 사이를 조절하고, 락과 MVCC로 구현합니다.",
          followUps: [
            [
              "격리 수준을 SERIALIZABLE로 올리면 동시성 문제가 모두 해결되나요?",
              "이상 현상은 막지만 락 대기와 데드락, 직렬화 실패가 크게 늘어 처리량이 떨어집니다. 그래서 전체를 올리기보다 필요한 부분에만 비관적·낙관적 락을 적용합니다."
            ]
          ],
          related: ["cs/gyeokri-sujun", "cs/mvcc", "cs/gongyu-rak"]
        },
        {
          id: "cs/jisokseong",
          slug: "jisokseong",
          title: "지속성",
          deep: false,
          def: "커밋된 결과는 서버가 죽어도 사라지지 않는 성질(Durability)이다.",
          why: "커밋이 성공했다고 응답한 데이터가 직후 서버 장애로 사라지는 것을 막기 위해서다.",
          how: [
            "데이터 파일에 바로 쓰면 느리므로, 변경 내용을 먼저 순차 기록하기 빠른 redo 로그(WAL, Write-Ahead Log)에 디스크까지 기록한 뒤 커밋을 완료한다.",
            "- 실제 데이터 페이지는 메모리(버퍼 풀)에서 바뀌고 나중에 모아서 디스크에 쓴다.",
            "- 장애 후 재시작하면 redo 로그를 다시 적용해 커밋된 변경을 복구한다.",
            "- MySQL의 `innodb_flush_log_at_trx_commit=1`(기본)은 커밋마다 로그를 디스크에 동기화한다. 값을 낮추면 빨라지지만 장애 시 최근 커밋을 잃을 수 있다."
          ],
          flow: ["변경을 버퍼 풀에 반영", "redo 로그를 디스크에 기록", "커밋 완료 응답", "데이터 페이지는 나중에 기록", "장애 시 redo 로그로 복구"],
          use: ["결제 DB는 `innodb_flush_log_at_trx_commit=1`을 유지해 커밋된 거래를 잃지 않게 한다."],
          answer: "지속성은 커밋된 결과가 장애가 나도 사라지지 않는 성질입니다. 데이터 페이지보다 먼저 redo 로그(WAL)를 디스크에 기록한 뒤 커밋을 완료하고, 재시작할 때 로그로 복구합니다.",
          followUps: [
            [
              "데이터 파일에 바로 쓰지 않고 로그를 먼저 쓰는 이유는?",
              "데이터 페이지는 디스크 곳곳에 흩어진 무작위 쓰기라 느리지만, 로그는 끝에 이어 쓰는 순차 쓰기라 빠릅니다. 로그만 안전하게 남기면 데이터 페이지는 나중에 모아서 써도 복구할 수 있습니다."
            ]
          ],
          related: ["cs/wonjaseong", "cs/repeulrikeisyeon"]
        }
      ]
    },
    {
      name: "이상 현상 · MVCC",
      compare: {
        cols: ["기준", "Dirty Read", "Non-Repeatable Read", "Phantom Read"],
        rows: [
          ["무엇이 보이나", "커밋 안 된 변경", "다시 읽으니 바뀐 값", "없던 행이 나타남"],
          ["대상", "행 값", "기존 행 값", "조건에 맞는 행 집합"],
          ["발생 격리 수준", "READ UNCOMMITTED", "READ COMMITTED 이하", "REPEATABLE READ 이하(표준)"],
          ["막는 수준", "READ COMMITTED", "REPEATABLE READ", "SERIALIZABLE"]
        ]
      },
      concepts: [
        {
          id: "cs/dirty-read",
          slug: "dirty-read",
          title: "Dirty Read",
          deep: false,
          def: "다른 트랜잭션이 아직 커밋하지 않은 변경을 읽는 현상이다.",
          why: "롤백될 수 있는 커밋 전 데이터로 판단하면 실제로 존재한 적 없는 값에 기반한 결과가 나오므로, 어떤 격리 수준에서 이를 막는지 알아야 하기 때문이다.",
          how: [
            "트랜잭션 A가 잔액을 0으로 바꾸고 아직 커밋하지 않았는데 B가 0을 읽는다. 이후 A가 롤백하면 B는 존재한 적 없는 값으로 판단한 셈이 된다.",
            "READ UNCOMMITTED에서만 발생하며, READ COMMITTED 이상에서는 발생하지 않는다.",
            "- 왜 위험한가: 롤백될 수 있는 값을 근거로 결제나 재고를 판단하면 실제 DB 상태와 어긋난 결정을 하게 된다.",
            "- 실무: 대부분의 DB 기본 격리 수준(MySQL은 REPEATABLE READ, PostgreSQL·Oracle은 READ COMMITTED)에서는 일어나지 않는다. PostgreSQL은 READ UNCOMMITTED를 지정해도 READ COMMITTED처럼 동작한다."
          ],
          use: ["실무 DB는 READ COMMITTED 이상을 써서 Dirty Read를 원천 차단한다."],
          answer: "Dirty Read는 다른 트랜잭션이 커밋하지 않은 변경을 읽는 현상입니다. 그 트랜잭션이 롤백하면 존재한 적 없는 값으로 판단한 셈이 되며, READ UNCOMMITTED에서만 발생합니다.",
          analogy: "친구가 아직 고민 중인 메모를 보고 확정된 약속으로 착각하는 것과 같습니다.",
          followUps: [
            [
              "READ UNCOMMITTED를 쓰는 경우가 있나요?",
              "정확성이 전혀 중요하지 않은 대략적인 통계나 모니터링 조회에서 락 대기를 피하려고 쓰기도 하지만, MVCC가 있는 DB에서는 이득이 작아 거의 쓰지 않습니다."
            ]
          ],
          related: ["cs/non-repeatable-read", "cs/gyeokri-sujun"]
        },
        {
          id: "cs/non-repeatable-read",
          slug: "non-repeatable-read",
          title: "Non-Repeatable Read",
          deep: false,
          def: "한 트랜잭션에서 같은 행을 두 번 읽었는데 그 사이 다른 트랜잭션의 커밋으로 값이 달라지는 현상이다.",
          why: "한 트랜잭션 안에서 같은 행을 두 번 읽었는데 값이 달라져 계산이 어긋나는 문제를 알고 막기 위해서다.",
          how: [
            "A가 상품 가격을 1000원으로 읽고, B가 1500원으로 수정·커밋한 뒤, A가 다시 읽으면 1500원이 나온다. A 입장에서는 한 트랜잭션 안에서 데이터가 바뀐 것이다.",
            "READ COMMITTED에서 발생하고, REPEATABLE READ 이상에서는 발생하지 않는다.",
            "- 문제 상황: 한 트랜잭션에서 잔액을 읽어 검증한 뒤 다시 읽어 차감하면, 그 사이 값이 바뀌어 검증과 처리의 기준이 달라진다.",
            "- 해결: 격리 수준을 REPEATABLE READ로 올리거나, 처음부터 `SELECT ... FOR UPDATE`로 행을 잠가 읽는다. 갱신 경쟁은 버전 컬럼을 쓰는 낙관적 락으로도 막는다.",
            "- MVCC를 쓰는 DB의 REPEATABLE READ는 트랜잭션의 첫 조회 시점 스냅샷을 계속 읽어 같은 값을 보장한다."
          ],
          use: ["정산 배치처럼 한 트랜잭션 안에서 같은 데이터를 여러 번 읽어 계산하는 작업은 REPEATABLE READ나 스냅샷 읽기로 일관된 값을 쓴다."],
          answer: "Non-Repeatable Read는 한 트랜잭션에서 같은 행을 두 번 읽었는데 그사이 다른 트랜잭션의 커밋으로 값이 달라지는 현상입니다. READ COMMITTED에서 발생하고 REPEATABLE READ에서 막힙니다.",
          followUps: [
            [
              "PostgreSQL 기본 격리 수준에서 이 현상이 생기나요?",
              "네. PostgreSQL 기본값은 READ COMMITTED라 문장마다 새 스냅샷을 읽어 생길 수 있습니다. MySQL 기본값인 REPEATABLE READ에서는 생기지 않습니다."
            ]
          ],
          related: ["cs/dirty-read", "cs/phantom-read"]
        },
        {
          id: "cs/phantom-read",
          slug: "phantom-read",
          title: "Phantom Read",
          deep: false,
          def: "같은 조건으로 두 번 조회했는데 그 사이 다른 트랜잭션이 행을 추가·삭제해 결과 행 수가 달라지는 현상이다.",
          why: "같은 조건으로 다시 조회했을 때 없던 행이 나타나는 문제가 어떤 격리 수준과 락으로 막히는지 알기 위해서다.",
          how: [
            "A가 `WHERE age > 20`으로 10건을 조회하고, B가 25살 회원을 추가·커밋한 뒤, A가 같은 조건으로 다시 조회하면 11건이 나온다. 기존 행 값이 아니라 \"없던 행\"이 유령처럼 나타나는 것이 Non-Repeatable Read와의 차이다.",
            "표준상 REPEATABLE READ까지 발생할 수 있고 SERIALIZABLE에서 막힌다. MySQL InnoDB는 REPEATABLE READ에서도 일반 조회는 MVCC 스냅샷으로, 잠금 읽기는 넥스트 키 락으로 대부분 막는다.",
            "- 문제 상황: \"이번 달 예약이 10건 미만이면 예약 허용\"처럼 조회 결과의 개수로 판단하는 로직은, 그 사이 다른 트랜잭션이 행을 추가하면 규칙이 깨진다.",
            "- 해결: SERIALIZABLE을 쓰거나, `SELECT ... FOR UPDATE`의 범위 잠금, 또는 유니크 제약이나 카운터 행 잠금처럼 경쟁 지점을 한 행으로 모은다."
          ],
          use: ["\"하루 예약 10건 제한\"처럼 개수를 세고 INSERT하는 로직은 잠금 읽기나 별도 카운터 행 락으로 팬텀을 막는다."],
          answer: "Phantom Read는 같은 조건으로 두 번 조회했는데 그사이 다른 트랜잭션이 행을 추가·삭제해 결과 행 집합이 달라지는 현상입니다. 기존 행 값이 아니라 없던 행이 나타난다는 점이 Non-Repeatable Read와 다르고, MySQL은 MVCC와 넥스트 키 락으로 대부분 막습니다.",
          analogy: "방금 센 교실 인원을 다시 세니 그사이 들어온 학생 때문에 숫자가 달라지는 것과 같습니다.",
          followUps: [
            [
              "MySQL REPEATABLE READ에서도 팬텀이 생기는 경우는?",
              "일반 SELECT는 스냅샷이라 안 보이지만, 같은 트랜잭션에서 잠금 읽기(FOR UPDATE)나 UPDATE를 섞으면 최신 데이터를 읽어 새 행이 보일 수 있습니다. 스냅샷 읽기와 잠금 읽기를 섞을 때 주의합니다."
            ]
          ],
          related: ["cs/non-repeatable-read", "cs/gaep-rak-nekseuteu-ki-rak"]
        },
        {
          id: "cs/gyeokri-sujun",
          slug: "gyeokri-sujun",
          title: "격리 수준",
          deep: false,
          def: "동시에 실행되는 트랜잭션이 서로의 변경을 얼마나 볼 수 있는지 정하는 설정이다.",
          why: "정합성과 동시 처리 성능 사이의 균형을 서비스 요구에 맞게 고르기 위해서다.",
          how: [
            "- READ UNCOMMITTED: 커밋되지 않은 변경도 읽는다. Dirty Read 발생. 실무에서 거의 쓰지 않는다.",
            "- READ COMMITTED: 커밋된 데이터만 읽는다. Non-Repeatable Read 발생. PostgreSQL, Oracle, SQL Server의 기본값.",
            "- REPEATABLE READ: 트랜잭션 안에서 같은 행은 항상 같은 값이다. 표준상 Phantom Read 발생. MySQL InnoDB의 기본값.",
            "- SERIALIZABLE: 순서대로 실행한 것과 같은 결과를 보장한다. 가장 안전하지만 락 경합과 대기가 많아 동시성이 가장 낮다.",
            "`SET TRANSACTION ISOLATION LEVEL READ COMMITTED;`로 바꿀 수 있다."
          ],
          use: [
            "스프링에서 `@Transactional(isolation = Isolation.READ_COMMITTED)`로 특정 메서드만 격리 수준을 바꾼다.",
            "대부분은 DB 기본값을 유지하고 필요한 곳만 락으로 보완한다."
          ],
          myth: [["격리 수준이 높을수록 무조건 좋다.", "이상 현상은 줄지만 락 대기, 데드락, 재시도가 늘어 처리량이 떨어집니다. 업무 요구에 맞는 수준을 골라야 합니다."]],
          answer: "격리 수준은 트랜잭션이 서로의 변경을 얼마나 볼 수 있는지 정하는 설정입니다. READ UNCOMMITTED, READ COMMITTED, REPEATABLE READ, SERIALIZABLE 순으로 이상 현상이 줄지만 동시성이 떨어집니다. MySQL 기본은 REPEATABLE READ, PostgreSQL·Oracle 기본은 READ COMMITTED입니다.",
          followUps: [
            [
              "MySQL은 왜 REPEATABLE READ가 기본인가요?",
              "과거 문장 기반 바이너리 로그 복제에서 READ COMMITTED를 쓰면 원본과 복제본 결과가 달라질 수 있어 REPEATABLE READ를 기본으로 했습니다. 지금은 행 기반 복제가 기본이라 READ COMMITTED로 바꾸는 서비스도 많습니다."
            ]
          ],
          related: ["cs/dirty-read", "cs/non-repeatable-read", "cs/phantom-read", "cs/mvcc"]
        },
        {
          id: "cs/mvcc",
          slug: "mvcc",
          title: "MVCC",
          deep: true,
          def: "데이터의 여러 버전을 유지해, 각 트랜잭션이 자기 시점에 맞는 버전을 락 없이 읽게 하는 동시성 제어 방식(Multi-Version Concurrency Control)이다.",
          why: "읽기에 공유 락을 걸면 쓰는 트랜잭션이 끝날 때까지 읽기가 기다리고, 반대도 마찬가지라 동시성이 크게 떨어진다. MVCC를 쓰면 읽기와 쓰기가 서로를 막지 않는다.",
          how: [
            "InnoDB 기준 동작:",
            "1) 행을 수정하면 새 값을 행에 쓰고, 이전 값은 undo 로그에 남긴다. 각 행에는 마지막으로 수정한 트랜잭션 ID와 undo 로그를 가리키는 포인터가 있다.",
            "2) 트랜잭션이 조회할 때 읽기 뷰(Read View)를 만든다. 읽기 뷰는 \"이 시점에 커밋된 트랜잭션이 어디까지인가\"를 기록한다.",
            "3) 행을 읽을 때 그 행의 트랜잭션 ID가 읽기 뷰 기준으로 보이지 않는 것(아직 커밋 안 됐거나 나중에 시작)이면, undo 로그를 따라가 보이는 버전을 찾아 읽는다.",
            "- READ COMMITTED: SELECT 문마다 새 읽기 뷰를 만든다. 그래서 그사이 커밋된 최신 값이 보인다.",
            "- REPEATABLE READ: 트랜잭션의 첫 SELECT 때 만든 읽기 뷰를 끝까지 쓴다. 그래서 같은 값이 반복해서 읽힌다.",
            "이렇게 스냅샷을 읽는 것을 일관된 읽기(consistent read)라 한다. 반면 `SELECT ... FOR UPDATE`, UPDATE, DELETE는 스냅샷이 아니라 최신 커밋 데이터를 읽고 락을 거는 잠금 읽기(locking read)다."
          ],
          flow: ["수정 시 이전 값을 undo에 저장", "조회 시 읽기 뷰 생성", "행의 트랜잭션 ID 확인", "안 보이면 undo로 이전 버전", "보이는 버전 반환"],
          code: "-- 세션 A (REPEATABLE READ)\nSTART TRANSACTION;\nSELECT price FROM product WHERE id = 1;   -- 1000 (읽기 뷰 생성)\n\n-- 세션 B\nUPDATE product SET price = 1500 WHERE id = 1;\nCOMMIT;\n\n-- 세션 A\nSELECT price FROM product WHERE id = 1;   -- 여전히 1000 (undo 로그의 이전 버전)\nSELECT price FROM product WHERE id = 1 FOR UPDATE;  -- 1500 (잠금 읽기는 최신 값)\nCOMMIT;",
          codeLang: "sql",
          use: [
            "조회가 많은 서비스에서 일반 SELECT가 UPDATE를 기다리지 않아 응답이 안정적이다.",
            "모니터링에서 오래 열린 트랜잭션을 찾아 undo 로그(history list)가 쌓이는 것을 막는다."
          ],
          warn: [
            "오래 열려 있는 트랜잭션이 있으면 그 읽기 뷰가 필요로 하는 undo 로그를 지우지 못해 undo 영역이 계속 커지고 성능이 떨어진다. 트랜잭션을 짧게 유지한다.",
            "스냅샷으로 읽은 값을 기준으로 계산해 UPDATE하면, 그사이 다른 트랜잭션의 변경을 덮어쓰는 갱신 손실이 생길 수 있다. 잠금 읽기나 낙관적 락을 쓴다."
          ],
          myth: [
            [
              "MVCC가 있으면 락이 필요 없다.",
              "일반 조회만 락 없이 읽을 뿐 쓰기끼리는 여전히 배타 락으로 충돌을 막습니다. 읽은 값으로 계산해 쓰는 로직은 잠금 읽기나 낙관적 락이 필요합니다."
            ]
          ],
          answer: "MVCC는 데이터를 수정할 때 이전 버전을 undo 로그에 남기고, 트랜잭션이 자기 읽기 뷰 기준으로 보이는 버전을 락 없이 읽게 하는 방식입니다. 그래서 읽기와 쓰기가 서로를 막지 않습니다. READ COMMITTED는 쿼리마다, REPEATABLE READ는 첫 조회 때 만든 스냅샷을 씁니다.",
          analogy: "구글 문서의 버전 기록과 같습니다. 누가 편집 중이어도 나는 내가 연 시점의 버전을 그대로 읽을 수 있습니다.",
          qa: [
            "MVCC는 어떻게 동작하나요?",
            "데이터를 수정할 때 이전 버전을 undo 로그에 남겨 두고, 트랜잭션은 자기 읽기 뷰 기준으로 보이는 버전을 읽는 방식입니다. 그래서 읽을 때 락을 걸지 않아 읽기와 쓰기가 서로를 막지 않습니다. READ COMMITTED는 쿼리마다 새 스냅샷을, REPEATABLE READ는 트랜잭션 첫 조회 시점의 스냅샷을 계속 써서 격리 수준의 차이가 생깁니다. 단, SELECT FOR UPDATE나 UPDATE는 최신 데이터를 읽고 락을 겁니다."
          ],
          followUps: [
            [
              "스냅샷 읽기만으로 재고를 차감하면 어떤 문제가 생기나요?",
              "두 트랜잭션이 같은 스냅샷에서 재고 10을 읽고 각자 9로 쓰면 하나의 차감이 사라지는 갱신 손실이 생깁니다. `FOR UPDATE`로 최신 값을 잠가 읽거나 `SET stock = stock - 1`처럼 원자적으로 갱신해야 합니다."
            ],
            [
              "오래 열린 트랜잭션이 왜 성능을 떨어뜨리나요?",
              "그 트랜잭션의 읽기 뷰가 필요로 하는 이전 버전을 지울 수 없어 undo 로그가 계속 쌓이고, 다른 조회들이 긴 버전 체인을 따라가야 해 느려집니다."
            ],
            [
              "MVCC에서 커밋된 버전인지 어떻게 판단하나요?",
              "읽기 뷰는 생성 시점에 활성 상태인 트랜잭션 ID 목록을 기록합니다. 행의 트랜잭션 ID가 내 것이거나 그 목록에 없는 과거 ID면 보이고, 활성 목록에 있거나 이후 ID면 안 보여 undo의 이전 버전을 찾습니다."
            ]
          ],
          related: ["cs/gyeokri-sujun", "cs/wonjaseong", "cs/nakgwanjeok-rak"]
        }
      ]
    },
    {
      name: "락",
      compare: {
        cols: ["기준", "비관적 락", "낙관적 락"],
        rows: [
          ["가정", "충돌이 자주 난다", "충돌이 드물다"],
          ["구현", "SELECT ... FOR UPDATE", "version 컬럼 비교"],
          ["충돌 시", "다른 요청이 대기", "예외 후 재시도"],
          ["장점", "정확, 재시도 불필요", "대기 없음, 처리량 높음"],
          ["적합한 곳", "재고 차감, 좌석 예약", "게시글·설정 수정"]
        ]
      },
      concepts: [
        {
          id: "cs/gongyu-rak",
          slug: "gongyu-rak",
          title: "공유 락",
          deep: false,
          def: "읽기를 위해 거는 락(S Lock)으로, 여러 트랜잭션이 동시에 걸 수 있지만 걸려 있는 동안 배타 락은 걸 수 없다.",
          why: "누군가 읽는 동안 다른 트랜잭션이 그 행을 바꾸지 못하게 하면서도 여러 읽기는 동시에 허용하기 위해서다.",
          how: [
            "`SELECT ... FOR SHARE`(MySQL 8.0, 이전에는 `LOCK IN SHARE MODE`)로 건다.",
            "- 다른 트랜잭션도 같은 행을 읽기 위해 공유 락을 걸 수 있다.",
            "- 하지만 수정·삭제(배타 락)는 공유 락이 모두 풀릴 때까지 기다린다.",
            "\"읽은 값이 트랜잭션이 끝날 때까지 바뀌지 않아야 할 때\" 쓴다. 예: 부모 행이 삭제되지 않음을 보장하고 자식 행을 추가할 때.",
            "InnoDB의 일반 SELECT는 MVCC로 읽으므로 락을 걸지 않는다."
          ],
          use: ["부모 행을 FOR SHARE로 읽어 삭제되지 않게 한 뒤 자식 행을 추가한다."],
          answer: "공유 락은 읽기를 위한 락으로 여러 트랜잭션이 동시에 걸 수 있지만, 걸려 있는 동안 다른 트랜잭션은 그 행을 수정할 수 없습니다. `SELECT ... FOR SHARE`로 걸며, 읽은 값이 트랜잭션 끝까지 바뀌지 않아야 할 때 씁니다.",
          analogy: "도서관 열람실의 책처럼 여러 명이 함께 읽을 수는 있지만, 누군가 읽는 동안에는 책을 고쳐 쓸 수 없습니다.",
          followUps: [
            [
              "공유 락을 건 두 트랜잭션이 모두 UPDATE하려 하면?",
              "각자 배타 락으로 올리려면 상대의 공유 락이 풀려야 하므로 서로 기다리는 데드락이 됩니다. 수정할 목적이면 처음부터 FOR UPDATE로 배타 락을 거는 것이 안전합니다."
            ]
          ],
          related: ["cs/baeta-rak", "cs/gyeokriseong"]
        },
        {
          id: "cs/baeta-rak",
          slug: "baeta-rak",
          title: "배타 락",
          deep: false,
          def: "쓰기를 위해 거는 락(X Lock)으로, 한 트랜잭션만 걸 수 있고 다른 트랜잭션의 공유·배타 락을 모두 막는다.",
          why: "한 트랜잭션이 행을 수정하는 동안 다른 트랜잭션이 같은 행을 수정하거나 잠그지 못하게 해 갱신 손실을 막기 위해서다.",
          how: [
            "UPDATE, DELETE, INSERT, `SELECT ... FOR UPDATE`가 건다. 트랜잭션이 커밋하거나 롤백할 때 풀린다.",
            "- 같은 행에 배타 락을 걸려는 다른 트랜잭션은 기다린다. `innodb_lock_wait_timeout`(기본 50초)이 지나면 오류가 난다.",
            "- MVCC 덕분에 일반 SELECT는 배타 락이 걸린 행도 기다리지 않고 이전 버전을 읽는다.",
            "- InnoDB는 행 자체가 아니라 인덱스 레코드에 락을 건다. 조건 컬럼에 인덱스가 없으면 훑은 모든 행이 잠겨 사실상 테이블 전체가 잠길 수 있다."
          ],
          use: ["`UPDATE ... WHERE id = ?`처럼 PK나 인덱스 조건으로 수정해 잠기는 범위를 한 행으로 제한한다."],
          myth: [["배타 락이 걸리면 그 행을 아무도 읽지 못한다.", "MVCC 덕분에 일반 SELECT는 기다리지 않고 이전 버전을 읽습니다. 막히는 것은 잠금 읽기와 수정입니다."]],
          answer: "배타 락은 쓰기를 위한 락으로 한 트랜잭션만 걸 수 있고 다른 트랜잭션의 공유·배타 락을 모두 막습니다. UPDATE, DELETE, `SELECT ... FOR UPDATE`가 걸고 커밋이나 롤백 때 풀립니다. InnoDB는 인덱스 레코드에 락을 걸어, 인덱스 없는 조건은 넓은 범위를 잠급니다.",
          analogy: "화장실 문을 잠그는 것과 같습니다. 안에 한 명만 있을 수 있고 다른 사람은 나올 때까지 기다립니다.",
          followUps: [
            [
              "UPDATE 조건 컬럼에 인덱스가 없으면 어떻게 되나요?",
              "InnoDB는 조건을 확인하려고 훑은 모든 레코드에 락을 걸기 때문에 사실상 테이블 전체가 잠길 수 있습니다. 그동안 다른 수정이 모두 막히므로 수정 조건 컬럼에는 인덱스를 둡니다."
            ]
          ],
          related: ["cs/gongyu-rak", "cs/bigwanjeok-rak", "cs/db-dedeurak"]
        },
        {
          id: "cs/bigwanjeok-rak",
          slug: "bigwanjeok-rak",
          title: "비관적 락",
          deep: true,
          def: "충돌이 자주 일어날 것이라 보고, 데이터를 읽는 시점에 먼저 락을 걸어 다른 트랜잭션의 수정을 막는 전략이다.",
          why: "재고 차감이나 좌석 예약처럼 같은 행을 동시에 수정하는 요청이 몰리면, 각자 읽은 값으로 계산해 덮어쓰면서 갱신이 사라진다(재고 10개에 동시 주문 2건 → 둘 다 9로 저장). 읽을 때부터 잠가야 순서대로 처리된다.",
          how: [
            "1) 트랜잭션 A가 `SELECT ... FOR UPDATE`로 재고 행을 읽으며 배타 락을 건다.",
            "2) 트랜잭션 B도 같은 행을 `FOR UPDATE`로 읽으려다 A가 끝날 때까지 기다린다.",
            "3) A가 재고를 9로 바꾸고 커밋하면 락이 풀린다.",
            "4) B가 최신 값 9를 읽고 8로 바꾼다.",
            "- 장점: 충돌이 잦아도 데이터가 정확하고, 재시도 로직이 필요 없다.",
            "- 단점: 대기 시간이 생겨 처리량이 떨어지고, 여러 행을 잠그면 데드락 위험이 있다.",
            "- JPA에서는 `@Lock(LockModeType.PESSIMISTIC_WRITE)`가 `FOR UPDATE`로 변환된다."
          ],
          flow: ["트랜잭션 시작", "FOR UPDATE로 행 잠금", "다른 요청은 대기", "값 변경 후 커밋", "락 해제, 다음 요청 진행"],
          code: "// Spring Data JPA\npublic interface StockRepository extends JpaRepository<Stock, Long> {\n    @Lock(LockModeType.PESSIMISTIC_WRITE)\n    @Query(\"select s from Stock s where s.productId = :productId\")\n    Optional<Stock> findForUpdate(@Param(\"productId\") Long productId);\n}\n\n@Transactional\npublic void decrease(Long productId, int qty) {\n    Stock stock = stockRepository.findForUpdate(productId).orElseThrow();\n    stock.decrease(qty);   // 커밋 시 UPDATE, 이후 락 해제\n}",
          codeLang: "java",
          use: [
            "한정 수량 쿠폰 발급에서 쿠폰 재고 행을 FOR UPDATE로 잠가 초과 발급을 막는다.",
            "콘서트 좌석 예약에서 좌석 행을 잠가 중복 예약을 막는다.",
            "여러 계좌를 잠글 때 항상 id 오름차순으로 잠가 데드락을 피한다."
          ],
          warn: [
            "트랜잭션 안에서만 의미가 있다. 트랜잭션 밖에서 `FOR UPDATE`를 실행하면 자동 커밋으로 바로 풀린다.",
            "여러 행을 잠글 때는 항상 같은 순서(id 오름차순)로 잠가 데드락을 피한다.",
            "락 대기 시간을 짧게 설정(`jakarta.persistence.lock.timeout` 힌트)해 무한정 기다리지 않게 한다."
          ],
          myth: [
            [
              "@Lock만 붙이면 트랜잭션 밖에서도 잠긴다.",
              "락은 트랜잭션이 끝날 때 풀리므로 트랜잭션 밖에서는 조회 직후 자동 커밋되어 아무 효과가 없습니다. 반드시 @Transactional 안에서 써야 합니다."
            ]
          ],
          answer: "비관적 락은 충돌이 잦다고 보고 읽는 시점에 `SELECT ... FOR UPDATE`로 배타 락을 거는 전략입니다. 다른 트랜잭션은 커밋될 때까지 기다리므로 재고 차감 같은 작업이 순서대로 정확히 처리됩니다. 대신 대기로 처리량이 떨어지고 데드락 위험이 있어 락 순서 고정과 타임아웃이 필요합니다.",
          analogy: "회의실을 쓰기 전에 미리 예약해 잠가 두는 것과 같습니다. 다른 사람은 예약이 끝날 때까지 기다립니다.",
          qa: [
            "재고 차감 같은 동시성 문제를 DB로 어떻게 해결하나요?",
            "충돌이 잦은 경우 비관적 락을 씁니다. SELECT FOR UPDATE로 읽는 순간 배타 락을 걸면 다른 트랜잭션은 커밋될 때까지 기다리므로 순서대로 차감됩니다. 데이터는 정확하지만 대기로 처리량이 떨어지고 데드락 위험이 있어, 락 순서를 고정하고 타임아웃을 둡니다. 충돌이 드물다면 버전 컬럼을 쓰는 낙관적 락을 고려합니다."
          ],
          followUps: [
            [
              "비관적 락 대신 synchronized를 쓰면 안 되나요?",
              "synchronized는 한 JVM 안의 스레드만 막으므로 서버가 여러 대면 소용없습니다. 또 @Transactional 프록시와 함께 쓰면 커밋 전에 락이 풀려 다른 스레드가 커밋 전 값을 읽을 수 있습니다. DB 락이나 분산 락을 씁니다."
            ],
            [
              "락 대기가 너무 길어지면 어떻게 하나요?",
              "`jakarta.persistence.lock.timeout` 힌트나 `NOWAIT`, `SKIP LOCKED`로 기다리는 시간을 제한합니다. 트래픽이 매우 몰리는 경우 Redis 원자 연산이나 대기열로 DB 앞에서 요청을 줄입니다."
            ],
            [
              "FOR UPDATE SKIP LOCKED는 언제 쓰나요?",
              "잠긴 행은 건너뛰고 잠기지 않은 행만 가져옵니다. 여러 워커가 작업 테이블에서 처리할 작업을 겹치지 않게 나눠 가져가는 작업 큐 구현에 유용합니다."
            ]
          ],
          related: ["cs/nakgwanjeok-rak", "cs/baeta-rak", "cs/db-dedeurak"]
        },
        {
          id: "cs/nakgwanjeok-rak",
          slug: "nakgwanjeok-rak",
          title: "낙관적 락",
          deep: true,
          def: "충돌이 드물 것이라 보고 락 없이 진행하다가, 수정하는 순간 버전을 비교해 그사이 다른 수정이 있었는지 확인하는 전략이다.",
          why: "대부분의 요청이 충돌하지 않는 상황에서 매번 락을 걸면 불필요한 대기가 생긴다. 낙관적 락은 DB 락을 오래 잡지 않아 처리량이 높고, 충돌한 드문 경우만 다시 시도한다.",
          how: [
            "1) 테이블에 `version` 컬럼을 둔다.",
            "2) 조회할 때 version 값(예: 3)도 함께 읽는다.",
            "3) 수정할 때 `UPDATE ... SET ..., version = 4 WHERE id = ? AND version = 3`처럼 읽었던 버전을 조건에 넣는다.",
            "4) 그사이 누군가 수정해 version이 4가 되었다면 조건에 맞는 행이 없어 갱신된 행 수가 0이다. 이를 충돌로 보고 예외를 던진다.",
            "5) 애플리케이션이 최신 데이터를 다시 읽어 재시도하거나 사용자에게 \"다른 사람이 먼저 수정했습니다\"라고 알린다.",
            "- JPA에서는 엔티티에 `@Version` 필드만 두면 3~4단계를 자동으로 해 주고, 충돌 시 `OptimisticLockException`(스프링에서는 `ObjectOptimisticLockingFailureException`)을 던진다.",
            "- 게시글·위키 수정, 설정 변경처럼 충돌이 드물고 덮어쓰기를 막아야 하는 곳에 맞다."
          ],
          flow: ["조회 시 version 함께 읽기", "락 없이 로직 수행", "version 조건으로 UPDATE", "0건이면 충돌 예외", "새 트랜잭션에서 재시도"],
          code: "@Entity\npublic class Post {\n    @Id @GeneratedValue\n    private Long id;\n    private String content;\n\n    @Version\n    private Long version;   // 수정할 때마다 자동 증가\n}\n\n// 실행되는 SQL\n// UPDATE post SET content = ?, version = 4 WHERE id = 1 AND version = 3\n// → 0건 갱신이면 ObjectOptimisticLockingFailureException",
          codeLang: "java",
          use: [
            "게시글·위키 동시 수정에서 나중에 저장한 사람에게 \"다른 사람이 먼저 수정했습니다\"를 보여 준다.",
            "관리자 설정 화면에서 서로의 변경을 덮어쓰지 않게 한다.",
            "스프링 Retry로 낙관적 락 예외 시 몇 번 재시도한다."
          ],
          warn: [
            "충돌이 잦은 곳(인기 상품 재고)에 쓰면 재시도가 폭증해 오히려 느려진다. 이런 곳은 비관적 락이나 원자적 UPDATE(`SET stock = stock - 1 WHERE stock > 0`)가 낫다.",
            "재시도는 새 트랜잭션에서 해야 한다. 실패한 트랜잭션 안에서 다시 시도하면 같은 스냅샷을 읽는다."
          ],
          myth: [["낙관적 락은 DB 락을 전혀 쓰지 않는다.", "UPDATE 문장 자체는 실행 순간 짧게 배타 락을 겁니다. 오래 잡는 락이 없다는 뜻입니다."]],
          answer: "낙관적 락은 충돌이 드물다고 보고 락 없이 진행하다가, 수정할 때 version을 조건에 넣어 그사이 변경이 있었는지 확인하는 전략입니다. 갱신된 행이 0이면 충돌로 보고 예외를 던져 재시도하거나 사용자에게 알립니다. JPA는 `@Version`만 두면 이를 자동으로 처리합니다.",
          analogy: "공유 문서를 저장할 때 \"내가 연 뒤 누가 고쳤나요?\"를 확인하고, 고쳤으면 저장을 거절하는 것과 같습니다.",
          qa: [
            "비관적 락과 낙관적 락은 언제 각각 쓰나요?",
            "비관적 락은 읽을 때 미리 잠가 충돌을 막는 방식이라 재고 차감이나 좌석 예약처럼 충돌이 잦고 정확성이 중요한 곳에 씁니다. 낙관적 락은 버전 컬럼으로 수정 시점에만 충돌을 감지하므로 락 대기가 없어 처리량이 좋고, 게시글 수정처럼 충돌이 드문 곳에 씁니다. 낙관적 락은 충돌 시 예외가 나므로 재시도나 사용자 안내 로직이 필요합니다."
          ],
          followUps: [
            [
              "충돌이 잦은 곳에 낙관적 락을 쓰면 어떻게 되나요?",
              "대부분의 요청이 실패하고 재시도가 몰려 오히려 처리량이 떨어지고 DB 부하가 커집니다. 인기 상품 재고처럼 충돌이 잦으면 비관적 락이나 원자적 UPDATE가 낫습니다."
            ],
            [
              "재시도는 어디서 해야 하나요?",
              "실패한 트랜잭션은 롤백 대상이고 같은 영속성 컨텍스트와 스냅샷을 가지므로, 트랜잭션 바깥(호출하는 쪽)에서 새 트랜잭션으로 다시 실행해야 합니다."
            ],
            [
              "version 없이 낙관적 락처럼 할 수 있나요?",
              "`UPDATE stock SET qty = qty - 1 WHERE id = ? AND qty > 0`처럼 조건부 원자적 UPDATE로 갱신된 행 수를 확인하는 방법이 있습니다. 단순 증감은 이 방식이 더 간단하고 빠릅니다."
            ]
          ],
          related: ["cs/bigwanjeok-rak", "cs/mvcc"]
        },
        {
          id: "cs/gaep-rak-nekseuteu-ki-rak",
          slug: "gaep-rak-nekseuteu-ki-rak",
          title: "갭 락 · 넥스트 키 락",
          deep: false,
          def: "존재하는 행이 아니라 인덱스 레코드 사이의 빈 간격을 잠가 새 행이 끼어들지 못하게 하는 InnoDB의 락이다.",
          why: "범위 조회 중 그 사이에 새 행이 삽입되어 생기는 팬텀 리드를 락으로 막기 위해서다.",
          how: [
            "- 갭 락: 인덱스 값 10과 20 사이의 간격을 잠가, 그 사이 값(15)의 INSERT를 막는다.",
            "- 넥스트 키 락: 레코드 락 + 그 앞 간격의 갭 락. REPEATABLE READ에서 잠금 읽기와 UPDATE가 기본으로 건다.",
            "`SELECT * FROM orders WHERE amount BETWEEN 100 AND 200 FOR UPDATE`를 실행하면 범위 안에 새 행이 들어올 수 없어 팬텀 리드가 생기지 않는다.",
            "READ COMMITTED에서는 갭 락을 거의 쓰지 않아 락 범위가 작고 동시성이 높지만 팬텀이 생길 수 있다."
          ],
          use: ["예약 테이블에서 시간 범위를 FOR UPDATE로 조회해 그 범위에 겹치는 예약 INSERT를 막는다."],
          warn: ["갭 락은 서로 다른 트랜잭션이 같은 간격을 잠그고 각자 INSERT하려 할 때 데드락의 흔한 원인이 된다."],
          answer: "갭 락은 인덱스 레코드 사이의 빈 간격을 잠가 새 행이 끼어들지 못하게 하는 InnoDB의 락이고, 넥스트 키 락은 레코드 락과 그 앞 간격의 갭 락을 합친 것입니다. REPEATABLE READ에서 잠금 읽기와 UPDATE가 이를 걸어 팬텀을 막습니다.",
          analogy: "줄 서 있는 사람뿐 아니라 사람 사이 빈자리까지 막아 새치기를 못 하게 하는 것과 같습니다.",
          followUps: [
            [
              "갭 락 때문에 데드락이 나는 전형적인 상황은?",
              "두 트랜잭션이 존재하지 않는 같은 범위를 각각 FOR UPDATE로 조회하면 갭 락은 서로 호환되어 둘 다 성공합니다. 이후 각자 그 간격에 INSERT하려 하면 상대의 갭 락을 기다려 데드락이 납니다."
            ]
          ],
          related: ["cs/phantom-read", "cs/baeta-rak", "cs/db-dedeurak"]
        },
        {
          id: "cs/db-dedeurak",
          slug: "db-dedeurak",
          title: "DB 데드락",
          deep: false,
          def: "두 트랜잭션이 서로 상대가 가진 락을 기다리며 영원히 진행하지 못하는 상태다.",
          why: "트랜잭션들이 서로의 락을 기다리며 멈추는 상황을 이해하고, 락 획득 순서 통일과 재시도로 대비하기 위해서다.",
          how: [
            "트랜잭션 A가 1번 행을 잠그고 2번 행을 기다리고, B가 2번 행을 잠그고 1번 행을 기다리면 데드락이다.",
            "- InnoDB는 데드락을 자동으로 감지해 되돌리기 비용이 작은 트랜잭션 하나를 롤백한다(오류 1213).",
            "- `SHOW ENGINE INNODB STATUS`의 LATEST DETECTED DEADLOCK에서 원인을 확인한다.",
            "- 예방: 여러 행을 항상 같은 순서로 잠근다, 트랜잭션을 짧게 한다, 조건 컬럼에 인덱스를 둬 잠기는 범위를 줄인다.",
            "- 애플리케이션은 데드락 예외를 받으면 트랜잭션 전체를 재시도하도록 만든다."
          ],
          flow: ["A가 1번 행 잠금", "B가 2번 행 잠금", "A가 2번 행 대기", "B가 1번 행 대기", "DB가 감지해 한쪽 롤백"],
          use: ["이체 로직에서 두 계좌를 항상 id가 작은 쪽부터 잠근다.", "`SHOW ENGINE INNODB STATUS`의 최근 데드락 정보로 어떤 쿼리가 얽혔는지 분석한다."],
          answer: "DB 데드락은 두 트랜잭션이 서로 상대가 가진 락을 기다리며 진행하지 못하는 상태입니다. InnoDB는 이를 자동 감지해 한쪽을 롤백하므로, 애플리케이션은 락 순서를 고정하고 트랜잭션을 짧게 하며 데드락 예외에 재시도를 둡니다.",
          analogy: "좁은 골목에서 마주 보는 두 차가 서로 비켜 주기만 기다리는 상황과 같습니다.",
          followUps: [
            [
              "데드락과 락 대기 타임아웃은 어떻게 다른가요?",
              "데드락은 서로 기다려 영원히 풀리지 않는 상태라 DB가 감지 즉시 한쪽을 롤백합니다(1213). 락 대기 타임아웃은 한쪽이 오래 락을 잡고 있어 일정 시간 기다리다 포기하는 것으로(1205), 원인은 긴 트랜잭션인 경우가 많습니다."
            ]
          ],
          related: ["cs/bigwanjeok-rak", "cs/gaep-rak-nekseuteu-ki-rak"]
        }
      ]
    },
    {
      name: "정규화",
      compare: {
        cols: ["개념", "조건", "없애는 것"],
        rows: [
          ["이상 현상", "중복 테이블의 문제", "삽입·갱신·삭제 이상"],
          ["1NF", "모든 컬럼이 원자값", "반복 그룹, 다중값"],
          ["2NF", "1NF + 완전 함수 종속", "부분 함수 종속"],
          ["3NF", "2NF + 이행 종속 없음", "이행 함수 종속"],
          ["BCNF", "모든 결정자가 후보 키", "후보 키 아닌 결정자"],
          ["반정규화", "성능 위해 중복 허용", "조인 비용 (대가: 정합성)"]
        ]
      },
      concepts: [
        {
          id: "cs/isang-hyeonsang",
          slug: "isang-hyeonsang",
          title: "이상 현상",
          deep: false,
          def: "중복이 있는 테이블에서 데이터를 넣고, 고치고, 지울 때 생기는 문제다. 정규화의 목적이 이를 없애는 것이다.",
          why: "중복 저장된 데이터 때문에 삽입·수정·삭제 시 데이터가 불일치하거나 함께 사라지는 문제를 알기 위해서다.",
          how: [
            "학생·수강·학과 정보를 한 테이블에 모두 넣은 경우를 생각한다.",
            "- 삽입 이상: 아직 수강 신청을 안 한 학생은 수강 과목 칸을 채울 수 없어 학생 정보조차 저장하지 못한다.",
            "- 갱신 이상: 학과 이름이 여러 행에 반복되어 있어 일부 행만 고치면 같은 학과가 두 이름으로 남는다.",
            "- 삭제 이상: 한 학생의 마지막 수강 기록을 지우면 그 학생 정보까지 사라진다."
          ],
          use: ["주문 테이블에 회원 주소를 복사해 두면 주소 변경 시 일부 주문만 바뀌는 갱신 이상이 생긴다는 점을 설계 리뷰에서 확인한다."],
          answer: "이상 현상은 중복이 있는 테이블에서 생기는 삽입·갱신·삭제 문제입니다. 다른 정보 없이는 행을 넣을 수 없거나, 일부만 고쳐 데이터가 어긋나거나, 지우면 다른 정보까지 사라집니다. 정규화로 테이블을 나눠 해결합니다.",
          followUps: [
            [
              "반정규화하면 이상 현상이 다시 생기지 않나요?",
              "생길 수 있습니다. 그래서 반정규화한 값은 갱신 책임을 한 곳(서비스 로직이나 트리거)에 모으고, 주문 당시 가격처럼 원래 바뀌면 안 되는 스냅샷 값에 우선 적용합니다."
            ]
          ],
          related: ["cs/1nf", "cs/2nf", "cs/3nf"]
        },
        {
          id: "cs/1nf",
          slug: "1nf",
          title: "1NF",
          deep: false,
          def: "모든 컬럼이 더 이상 나눌 수 없는 원자값만 가지는 상태(제1정규형)다.",
          why: "한 칸에 여러 값을 넣으면 검색, 수정, 조인이 어려워지므로 모든 값을 원자값으로 만들기 위해서다.",
          how: [
            "`취미: 축구, 독서`처럼 한 칸에 여러 값을 넣거나, `전화1`, `전화2`처럼 같은 성격의 컬럼을 반복하면 1NF 위반이다.",
            "여러 값은 별도 테이블(회원_취미)로 나눠 한 행에 하나씩 저장한다. 그래야 \"축구가 취미인 회원\" 같은 검색과 인덱스가 가능하다.",
            "- 위반 예: 주문 테이블의 `상품목록` 컬럼에 \"A,B,C\"를 문자열로 저장하면 상품별 수량 변경, 집계, 외래 키 제약을 걸 수 없다.",
            "- 정규화는 1NF → 2NF(부분 함수 종속 제거) → 3NF(이행 함수 종속 제거) 순으로 진행하며, 1NF는 그 출발점이다.",
            "- JSON 컬럼은 원자값 원칙을 일부러 깨는 선택이다. 검색이나 조인 대상이 아닌 부가 정보에만 쓴다."
          ],
          use: ["쉼표로 이어 붙인 태그 문자열을 게시글_태그 테이블로 분리해 태그 검색과 인덱스를 가능하게 한다."],
          myth: [
            [
              "JSON 컬럼을 쓰면 무조건 1NF 위반이다.",
              "내부 값으로 검색하거나 조인하지 않는 부가 정보라면 실무적으로 허용합니다. 검색·집계 대상이면 테이블로 나누는 것이 맞습니다."
            ]
          ],
          answer: "1NF는 모든 컬럼이 원자값만 가지는 상태입니다. 한 칸에 여러 값을 넣거나 같은 성격의 컬럼을 반복하지 않고, 여러 값은 별도 테이블로 나눠 한 행에 하나씩 저장합니다.",
          followUps: [
            [
              "1NF를 어기면 어떤 쿼리가 어려워지나요?",
              "\"축구가 취미인 회원\"을 찾으려면 `LIKE '%축구%'`처럼 인덱스를 못 쓰는 검색을 해야 하고, 값 하나를 지우거나 개수를 세기도 어렵습니다."
            ]
          ],
          related: ["cs/2nf", "cs/isang-hyeonsang"]
        },
        {
          id: "cs/2nf",
          slug: "2nf",
          title: "2NF",
          deep: false,
          def: "1NF를 만족하고, 기본 키의 일부에만 의존하는 컬럼(부분 함수 종속)을 없앤 상태(제2정규형)다.",
          why: "복합 키의 일부에만 종속된 컬럼이 중복 저장되어 생기는 갱신 이상을 없애기 위해서다.",
          how: [
            "(학번, 과목코드)가 PK인 수강 테이블에 학생 이름이 있으면, 이름은 학번만으로 정해진다. PK 일부에만 의존하므로 같은 이름이 과목 수만큼 반복된다.",
            "학생 이름을 학생 테이블(학번 PK)로 분리하면 2NF가 된다.",
            "부분 종속은 복합 키일 때만 생기므로 단일 컬럼 PK 테이블은 1NF면 자동으로 2NF다."
          ],
          use: ["주문상품 테이블(주문id, 상품id)에 들어 있던 상품 설명을 상품 테이블로 옮긴다."],
          answer: "2NF는 1NF를 만족하면서 기본 키의 일부에만 의존하는 컬럼을 없앤 상태입니다. (학번, 과목코드)가 PK인데 학생 이름이 학번에만 의존하면 학생 테이블로 분리합니다. 단일 컬럼 PK라면 1NF면 자동으로 2NF입니다.",
          followUps: [
            [
              "부분 함수 종속이 왜 문제인가요?",
              "PK 일부에만 의존하는 값이 다른 키 조합 수만큼 반복 저장되어 갱신 이상이 생깁니다. 학생이 과목 5개를 들으면 이름이 5번 저장되고, 이름을 바꿀 때 5행을 모두 고쳐야 합니다."
            ]
          ],
          related: ["cs/1nf", "cs/3nf"]
        },
        {
          id: "cs/3nf",
          slug: "3nf",
          title: "3NF",
          deep: false,
          def: "2NF를 만족하고, 기본 키가 아닌 컬럼에 의존하는 컬럼(이행 함수 종속)을 없앤 상태(제3정규형)다.",
          why: "키가 아닌 컬럼을 거쳐 간접 종속된 데이터가 중복되어 한쪽만 수정되는 불일치를 막기 위해서다.",
          how: [
            "학생 테이블에 학번 → 학과코드 → 학과명 관계가 있으면, 학과명은 PK(학번)가 아니라 학과코드에 의존한다. 학과명이 학생 수만큼 반복되어 갱신 이상이 생긴다.",
            "학과 테이블(학과코드, 학과명)로 분리하고 학생 테이블에는 학과코드만 둔다.",
            "실무 설계는 보통 3NF까지를 목표로 한다."
          ],
          use: ["회원 테이블의 등급명·할인율을 등급 테이블로 분리하고 회원에는 등급 코드만 둔다."],
          answer: "3NF는 2NF를 만족하면서 키가 아닌 컬럼이 다른 키가 아닌 컬럼에 의존하는 이행 종속을 없앤 상태입니다. 학번 → 학과코드 → 학과명이면 학과 테이블로 분리합니다. 실무 설계는 보통 3NF를 목표로 합니다.",
          followUps: [
            [
              "2NF와 3NF의 차이를 한 문장으로 말하면?",
              "2NF는 키의 일부에만 의존하는 컬럼을, 3NF는 키가 아닌 다른 컬럼을 거쳐 키에 의존하는 컬럼을 분리하는 것입니다."
            ]
          ],
          related: ["cs/2nf", "cs/bcnf", "cs/banjeonggyuhwa"]
        },
        {
          id: "cs/bcnf",
          slug: "bcnf",
          title: "BCNF",
          deep: false,
          def: "3NF보다 강한 조건으로, 모든 결정자가 후보 키인 상태(보이스-코드 정규형)다.",
          why: "3NF를 만족해도 후보 키가 아닌 결정자 때문에 남는 이상 현상까지 없애기 위해서다.",
          how: [
            "3NF는 \"키가 아닌 컬럼이 키가 아닌 컬럼에 의존하면 안 된다\"였지만, 키의 일부가 키가 아닌 컬럼에 의존하는 경우는 남는다.",
            "예: (학생, 과목) → 교수이고, 교수 한 명은 한 과목만 가르친다(교수 → 과목). 교수는 후보 키가 아닌데 과목을 결정하므로 BCNF 위반이다. (교수, 과목) 테이블을 분리해 해결한다.",
            "분해하면 일부 종속성을 하나의 테이블 제약으로 표현할 수 없게 되는 경우도 있어, 3NF에서 멈추기도 한다."
          ],
          use: ["(학생, 과목) → 교수에서 교수 → 과목 관계가 있으면 (교수, 과목) 테이블을 분리한다."],
          answer: "BCNF는 모든 결정자가 후보 키인 상태로 3NF보다 강한 조건입니다. 키가 아닌 컬럼이 키의 일부를 결정하는 경우까지 분리합니다. 분해하면 일부 종속성을 하나의 제약으로 표현하기 어려워 3NF에서 멈추기도 합니다.",
          followUps: [
            [
              "3NF는 만족하지만 BCNF가 아닌 예는?",
              "(학생, 과목)이 키이고 교수 한 명이 한 과목만 가르치는 경우입니다. 교수가 과목을 결정하지만 교수는 후보 키가 아니므로 BCNF 위반이며, 교수가 바뀌면 여러 행을 고쳐야 합니다."
            ]
          ],
          related: ["cs/3nf"]
        },
        {
          id: "cs/banjeonggyuhwa",
          slug: "banjeonggyuhwa",
          title: "반정규화",
          deep: false,
          def: "조회 성능을 위해 정규화된 테이블에 일부러 중복이나 계산된 값을 두는 것이다.",
          why: "정규화로 테이블이 잘게 나뉘어 조인이 많아지고 조회가 느려질 때, 의도적인 중복으로 읽기 성능을 얻기 위해서다.",
          how: [
            "정규화를 많이 할수록 조인이 늘어 조회가 느려질 수 있다. 조회가 매우 잦고 쓰기는 드문 곳에 적용한다.",
            "- 게시글 테이블에 `comment_count`를 두어 매번 COUNT하지 않는다.",
            "- 주문 상품 테이블에 주문 당시 상품명·가격을 복사해 둔다(나중에 상품 가격이 바뀌어도 주문 내역은 그대로여야 하므로 사실상 필수).",
            "- 통계용 요약 테이블을 따로 만든다."
          ],
          use: [
            "게시글 목록에 매번 COUNT하지 않도록 `comment_count` 컬럼을 두고 댓글 작성·삭제 때 갱신한다.",
            "주문상품에 주문 당시 상품명과 가격을 복사해 상품 정보가 바뀌어도 주문 내역을 유지한다."
          ],
          warn: ["중복된 값의 일관성은 애플리케이션(또는 트리거)이 책임져야 한다. 댓글 수를 증가시키는 로직이 빠지면 값이 어긋난다."],
          answer: "반정규화는 조회 성능을 위해 정규화된 구조에 일부러 중복이나 계산된 값을 두는 것입니다. 조인과 집계를 줄여 읽기가 빨라지지만, 중복 값의 일관성은 애플리케이션이 책임져야 합니다.",
          analogy: "자주 찾는 연락처를 휴대폰 즐겨찾기에 따로 두는 것과 같습니다. 빠르지만 번호가 바뀌면 두 곳을 고쳐야 합니다.",
          followUps: [
            [
              "반정규화 대신 쓸 수 있는 방법은?",
              "먼저 인덱스와 쿼리를 개선하고, 그래도 부족하면 캐시(Redis)나 조회 전용 테이블, 머티리얼라이즈드 뷰, 검색 엔진처럼 원본과 분리된 읽기 모델을 고려합니다."
            ]
          ],
          related: ["cs/3nf"]
        }
      ]
    },
    {
      name: "조인",
      compare: {
        cols: ["기준", "Nested Loop Join", "Hash Join", "Sort Merge Join"],
        rows: [
          ["방식", "바깥 행마다 안쪽 탐색", "해시 테이블 만들고 탐색", "양쪽 정렬 후 병합"],
          ["유리한 경우", "안쪽에 인덱스가 있음", "인덱스 없는 대량 등호 조인", "이미 정렬된 데이터"],
          ["조건", "모든 조건", "등호 조건만", "등호·범위 조건"],
          ["추가 비용", "인덱스 없으면 매우 느림", "해시 테이블 메모리", "정렬 비용"]
        ]
      },
      concepts: [
        {
          id: "cs/inner-join",
          slug: "inner-join",
          title: "INNER JOIN",
          deep: false,
          def: "양쪽 테이블에서 조인 조건이 일치하는 행만 결과로 내는 조인이다.",
          why: "여러 테이블에 나눠 저장된 데이터 중 양쪽에 짝이 있는 행만 합쳐 조회하기 위해서다.",
          how: [
            "`SELECT m.name, o.id FROM member m JOIN orders o ON o.member_id = m.id`는 주문이 있는 회원만 나온다. 주문이 없는 회원과 회원이 없는 주문은 빠진다.",
            "- 일대다 조인이면 \"다\" 쪽 행 수만큼 결과가 늘어난다. 회원 1명에 주문 3건이면 회원 정보가 3번 나온다.",
            "- JPA의 `join fetch`도 SQL에서는 보통 INNER JOIN이다."
          ],
          use: ["주문과 회원을 INNER JOIN해 주문 목록에 주문자 이름을 함께 보여 준다."],
          answer: "INNER JOIN은 양쪽 테이블에서 조인 조건이 일치하는 행만 돌려줍니다. 일대다 조인이면 \"다\" 쪽 행 수만큼 결과가 늘어나므로 페이징과 집계에서 주의합니다.",
          analogy: "두 동아리 명단에 모두 이름이 있는 학생만 뽑는 것과 같습니다.",
          followUps: [
            [
              "일대다 INNER JOIN 결과에 LIMIT을 걸면 어떤 문제가 생기나요?",
              "부모 기준이 아니라 늘어난 행 기준으로 잘려, 부모 10개를 원했는데 자식 행 때문에 일부 부모만 나옵니다. 부모 id를 먼저 페이징한 뒤 자식을 따로 조회합니다."
            ]
          ],
          related: ["cs/outer-join", "cs/nested-loop-join"]
        },
        {
          id: "cs/outer-join",
          slug: "outer-join",
          title: "OUTER JOIN",
          deep: false,
          def: "한쪽 테이블의 행은 모두 남기고, 반대쪽에 일치하는 행이 없으면 NULL로 채우는 조인이다.",
          why: "짝이 없는 행도 빠뜨리지 않고 보여야 할 때, 예를 들어 주문이 없는 회원까지 조회하기 위해서다.",
          how: [
            "- LEFT OUTER JOIN: 왼쪽 테이블의 모든 행을 남긴다. \"주문이 없는 회원까지 포함한 회원별 주문 수\"에 쓴다.",
            "- RIGHT OUTER JOIN: 오른쪽 기준. LEFT로 순서를 바꿔 쓰는 것이 일반적이다.",
            "- FULL OUTER JOIN: 양쪽 모두 남긴다. MySQL은 지원하지 않아 LEFT와 RIGHT의 UNION으로 대신한다.",
            "\"주문이 한 번도 없는 회원\"은 `LEFT JOIN ... WHERE o.id IS NULL`로 찾는다."
          ],
          use: [
            "회원별 주문 수 통계에서 주문이 0건인 회원도 나오도록 LEFT JOIN과 COUNT를 쓴다.",
            "한 번도 로그인하지 않은 회원을 LEFT JOIN ... IS NULL로 찾는다."
          ],
          warn: ["LEFT JOIN한 오른쪽 테이블 조건을 WHERE에 두면 NULL 행이 걸러져 INNER JOIN과 같아진다. 오른쪽 조건은 ON 절에 둔다."],
          myth: [
            [
              "LEFT JOIN에서 오른쪽 조건을 WHERE에 둬도 결과는 같다.",
              "WHERE에 두면 NULL 행이 걸러져 INNER JOIN과 같아집니다. 오른쪽 테이블 조건은 ON 절에 둬야 합니다."
            ]
          ],
          answer: "OUTER JOIN은 한쪽 테이블의 행을 모두 남기고, 반대쪽에 짝이 없으면 NULL로 채웁니다. LEFT JOIN으로 주문이 없는 회원까지 포함할 수 있고, `WHERE 오른쪽.id IS NULL`로 짝이 없는 행만 찾을 수 있습니다.",
          followUps: [
            [
              "JPA에서 LEFT JOIN은 언제 생기나요?",
              "JPQL에서 `left join`을 명시하거나, 선택적(nullable) 연관관계를 EAGER로 로딩할 때 생깁니다. fetch join도 `left join fetch`로 쓰면 연관이 없는 엔티티까지 가져옵니다."
            ]
          ],
          related: ["cs/inner-join"]
        },
        {
          id: "cs/cross-join",
          slug: "cross-join",
          title: "CROSS JOIN",
          deep: false,
          def: "조인 조건 없이 두 테이블의 모든 행 조합(카티션 곱)을 만드는 조인이다.",
          why: "모든 조합이 필요한 경우에 쓰지만, 조인 조건을 빠뜨리면 결과가 폭증한다는 점을 알기 위해서다.",
          how: [
            "10행과 20행을 CROSS JOIN하면 200행이 된다. 사이즈 × 색상 조합 만들기, 날짜 테이블과 조합해 빈 날짜 채우기처럼 의도적으로 쓸 때가 있다.",
            "조인 조건을 실수로 빠뜨리면 같은 결과가 나와 결과가 폭증하므로 주의한다.",
            "- 문법: `SELECT * FROM size CROSS JOIN color` 또는 조건 없는 콤마 조인 `FROM size, color`로 쓴다.",
            "- 실수로 생기는 경우: 여러 테이블을 조인하면서 한 테이블의 조인 조건을 빠뜨리거나, JPQL에서 연관관계 없는 두 엔티티를 FROM에 나열하고 조건을 안 주면 카티션 곱이 생긴다.",
            "- 결과 행 수가 두 테이블 행 수의 곱만큼 커졌다면 조인 조건 누락을 먼저 의심한다."
          ],
          use: ["날짜 테이블과 상품 테이블을 CROSS JOIN한 뒤 판매 데이터를 LEFT JOIN해 판매가 없는 날도 0으로 채운 일별 리포트를 만든다."],
          answer: "CROSS JOIN은 조건 없이 두 테이블의 모든 행 조합을 만듭니다. 사이즈와 색상 조합처럼 의도적으로 쓰기도 하지만, 조인 조건을 빠뜨린 실수로도 같은 결과가 나와 행 수가 폭증합니다.",
          followUps: [
            [
              "결과 행 수가 예상보다 훨씬 많다면 무엇을 의심하나요?",
              "조인 조건 누락으로 생긴 카티션 곱이나, 일대다 조인이 여러 번 겹쳐 행이 곱으로 늘어난 경우를 먼저 확인합니다."
            ]
          ],
          related: ["cs/inner-join"]
        },
        {
          id: "cs/self-join",
          slug: "self-join",
          title: "SELF JOIN",
          deep: false,
          def: "같은 테이블을 별칭을 붙여 자기 자신과 조인하는 것이다.",
          why: "직원과 상사처럼 한 테이블 안의 행끼리 맺은 관계를 조회하기 위해서다.",
          how: [
            "직원 테이블에 `manager_id`가 있으면 `FROM employee e JOIN employee m ON e.manager_id = m.id`로 직원과 상사 이름을 함께 조회한다.",
            "카테고리 부모-자식처럼 계층 구조가 깊으면 재귀 CTE(`WITH RECURSIVE`)를 쓴다.",
            "- 상사가 없는 최상위 직원까지 포함하려면 INNER JOIN 대신 `LEFT JOIN`을 쓴다.",
            "- 같은 테이블의 행끼리 비교할 때도 쓴다. 예: 같은 고객의 중복 주문 찾기 `ON a.customer_id = b.customer_id AND a.id < b.id`.",
            "- JPA에서는 엔티티가 자기 자신을 `@ManyToOne`으로 참조하는 `parent` 필드로 매핑한다."
          ],
          use: [
            "`employee e JOIN employee m ON e.manager_id = m.id`로 직원과 상사 이름을 함께 조회한다.",
            "깊이를 모르는 카테고리 트리는 `WITH RECURSIVE`로 조회한다."
          ],
          answer: "SELF JOIN은 같은 테이블에 별칭을 붙여 자기 자신과 조인하는 것입니다. 직원과 상사, 카테고리의 부모와 자식처럼 한 테이블 안의 관계를 조회할 때 씁니다.",
          followUps: [
            [
              "계층이 깊은 트리를 SELF JOIN으로 조회하면 어떤 문제가 있나요?",
              "깊이만큼 조인을 반복해야 해 깊이가 정해지지 않으면 쿼리를 쓸 수 없습니다. 재귀 CTE를 쓰거나, 경로 문자열·클로저 테이블처럼 계층 조회에 맞는 모델을 씁니다."
            ]
          ],
          related: ["cs/inner-join"]
        },
        {
          id: "cs/nested-loop-join",
          slug: "nested-loop-join",
          title: "Nested Loop Join",
          deep: false,
          def: "바깥 테이블의 행마다 안쪽 테이블에서 조인 상대를 찾는 조인 실행 방식이다.",
          why: "조인 대상이 적고 안쪽 테이블에 인덱스가 있을 때 가장 빠르지만, 인덱스가 없으면 급격히 느려짐을 알기 위해서다.",
          how: [
            "이중 for 문과 같다. 바깥(드라이빙) 테이블을 한 행씩 읽고, 그 값으로 안쪽(드리븐) 테이블을 조회한다.",
            "- 안쪽 테이블의 조인 컬럼에 인덱스가 있으면 한 번의 조회가 O(log n)이라 빠르다. 없으면 바깥 행마다 안쪽을 전부 훑어 매우 느리다.",
            "- 바깥 테이블은 조건으로 걸러진 결과가 적은 쪽이 유리하다.",
            "OLTP(일반 서비스)의 조인은 대부분 이 방식이므로 FK 컬럼에 인덱스를 두는 것이 중요하다."
          ],
          flow: ["바깥 테이블에서 행 읽기", "조인 키로 안쪽 인덱스 탐색", "일치 행 결과에 추가", "바깥 다음 행으로 반복"],
          use: ["주문 조회가 느릴 때 `order_item.order_id`에 인덱스가 있는지 먼저 확인한다."],
          answer: "Nested Loop Join은 바깥 테이블의 행마다 안쪽 테이블에서 짝을 찾는 방식으로, 이중 반복문과 같습니다. 안쪽 조인 컬럼에 인덱스가 있으면 빠르고 없으면 매우 느려서, 일반 서비스에서는 FK 컬럼 인덱스가 핵심입니다.",
          analogy: "반 학생 명단을 한 명씩 보면서, 매번 성적표 묶음의 색인에서 그 학생 성적을 찾는 것과 같습니다.",
          followUps: [
            [
              "드라이빙 테이블은 어느 쪽이 좋은가요?",
              "조건으로 걸러진 결과가 적은 쪽을 바깥에 두면 안쪽 탐색 횟수가 줄어듭니다. 옵티마이저가 보통 알아서 고르지만, 통계가 부정확하면 잘못 고를 수 있어 실행 계획을 확인합니다."
            ]
          ],
          related: ["cs/hash-join", "cs/inner-join"]
        },
        {
          id: "cs/hash-join",
          slug: "hash-join",
          title: "Hash Join",
          deep: false,
          def: "작은 테이블로 해시 테이블을 만들고, 큰 테이블을 훑으며 해시로 짝을 찾는 조인 실행 방식이다.",
          why: "인덱스를 쓸 수 없는 대량 데이터의 등호 조인을 Nested Loop보다 훨씬 빠르게 처리하기 위해서다.",
          how: [
            "1) 빌드 단계: 작은 쪽 테이블의 조인 키로 메모리에 해시 테이블을 만든다.",
            "2) 프로브 단계: 큰 쪽 테이블을 한 번 훑으며 각 행의 키를 해시 테이블에서 찾는다.",
            "조인 컬럼에 인덱스가 없거나 대량 데이터를 등호 조건으로 조인할 때 유리하다. 범위 조건에는 쓸 수 없다. MySQL은 8.0.18부터 지원한다."
          ],
          flow: ["작은 테이블 선택(빌드)", "조인 키로 해시 테이블 생성", "큰 테이블 순차 스캔(프로브)", "해시로 짝 찾아 결과 생성"],
          use: ["분석용 대용량 배치 쿼리에서 인덱스 없는 두 테이블을 등호 조건으로 조인한다."],
          answer: "Hash Join은 작은 테이블로 해시 테이블을 만들고 큰 테이블을 한 번 훑으며 해시로 짝을 찾는 방식입니다. 인덱스가 없는 대량 등호 조인에 유리하지만 범위 조건에는 쓸 수 없고, 해시 테이블 메모리가 필요합니다.",
          followUps: [
            [
              "해시 테이블이 메모리보다 크면 어떻게 되나요?",
              "데이터를 키 해시로 여러 조각으로 나눠 디스크에 쓰고 조각별로 조인합니다. 디스크 입출력이 생겨 느려지므로 MySQL은 `join_buffer_size` 같은 설정이 영향을 줍니다."
            ]
          ],
          related: ["cs/nested-loop-join", "cs/sort-merge-join"]
        },
        {
          id: "cs/sort-merge-join",
          slug: "sort-merge-join",
          title: "Sort Merge Join",
          deep: false,
          def: "양쪽 테이블을 조인 키로 정렬한 뒤, 두 정렬된 목록을 앞에서부터 맞춰 가며 병합하는 조인 실행 방식이다.",
          why: "양쪽이 이미 정렬되어 있거나 범위 조건 조인일 때 대량 데이터를 효율적으로 합치기 위해서다.",
          how: [
            "병합 정렬의 합치기 단계와 같다. 두 목록이 정렬되어 있으면 한 번씩만 훑으면 된다.",
            "- 이미 정렬되어 있거나 인덱스로 정렬된 순서로 읽을 수 있으면 효율적이다.",
            "- 범위 조건 조인에도 쓸 수 있다.",
            "- 정렬 비용이 크면 불리하다. Oracle, PostgreSQL이 상황에 따라 선택한다."
          ],
          flow: ["양쪽 조인 키로 정렬", "두 목록 앞에서 비교", "작은 쪽 포인터 전진", "같으면 결과에 추가"],
          use: ["PostgreSQL에서 양쪽이 인덱스 순서로 읽히는 대용량 조인에 옵티마이저가 선택한다."],
          answer: "Sort Merge Join은 양쪽 테이블을 조인 키로 정렬한 뒤 앞에서부터 맞춰 가며 병합하는 방식입니다. 이미 정렬되어 있으면 효율적이고 범위 조건 조인에도 쓸 수 있지만, 정렬 비용이 크면 불리합니다.",
          analogy: "번호순으로 정렬된 두 명단을 위에서부터 나란히 내려가며 같은 번호를 짝짓는 것과 같습니다.",
          followUps: [
            [
              "MySQL도 Sort Merge Join을 쓰나요?",
              "MySQL은 Nested Loop 계열과 8.0.18부터의 Hash Join을 지원하고 Sort Merge Join은 지원하지 않습니다. Oracle, PostgreSQL, SQL Server는 상황에 따라 선택합니다."
            ]
          ],
          related: ["cs/hash-join"]
        }
      ]
    },
    {
      name: "RDB · NoSQL",
      compare: {
        cols: ["기준", "RDB", "NoSQL"],
        rows: [
          ["스키마", "고정 스키마", "유연한 스키마"],
          ["관계 조회", "SQL 조인", "함께 읽을 데이터를 모아 저장"],
          ["일관성", "ACID 트랜잭션", "최종적 일관성이 많음"],
          ["확장", "수직 확장 중심", "수평 확장 중심"],
          ["대표", "MySQL, PostgreSQL", "Redis, MongoDB, Cassandra"]
        ]
      },
      concepts: [
        {
          id: "cs/rdb",
          slug: "rdb",
          title: "RDB",
          deep: false,
          def: "데이터를 정해진 스키마의 테이블에 저장하고, SQL과 ACID 트랜잭션을 제공하는 관계형 데이터베이스다.",
          why: "정해진 스키마와 트랜잭션으로 데이터 정합성을 강하게 보장하고 복잡한 관계를 조인으로 조회하기 위해서다.",
          how: [
            "MySQL, PostgreSQL, Oracle이 대표적이다.",
            "- 강점: 정규화로 중복을 줄이고, 조인으로 복잡한 관계를 조회하며, 제약 조건과 트랜잭션으로 정합성을 지킨다.",
            "- 약점: 스키마 변경이 부담스럽고, 쓰기를 여러 서버로 나누는 수평 확장(샤딩)이 어렵다.",
            "주문, 결제, 회원처럼 정합성이 핵심인 데이터는 대부분 RDB에 둔다."
          ],
          use: ["주문, 결제, 정산처럼 트랜잭션이 필요한 핵심 데이터를 MySQL에 둔다."],
          answer: "RDB는 정해진 스키마의 테이블에 데이터를 저장하고 SQL 조인과 ACID 트랜잭션을 제공하는 데이터베이스입니다. 관계가 복잡하고 정합성이 중요한 주문·결제·회원 데이터에 적합하지만, 쓰기를 여러 서버로 나누는 수평 확장은 어렵습니다.",
          followUps: [
            [
              "RDB 쓰기 부하가 한계에 오면 어떻게 하나요?",
              "먼저 쿼리와 인덱스를 최적화하고, 쓰기를 메시지 큐로 비동기 처리하거나 배치로 모읍니다. 그래도 부족하면 테이블 파티셔닝, 서비스별 DB 분리, 마지막으로 샤딩을 고려합니다."
            ]
          ],
          related: ["cs/nosql", "cs/syading"]
        },
        {
          id: "cs/nosql",
          slug: "nosql",
          title: "NoSQL",
          deep: false,
          def: "관계형 모델이 아닌 데이터베이스를 통칭하는 말로, 유연한 스키마와 수평 확장을 중시한다.",
          why: "RDB로는 감당하기 어려운 대규모 트래픽과 유연한 스키마를 수평 확장으로 처리하기 위해서다.",
          how: [
            "처음부터 여러 서버로 데이터를 나눠 저장하도록 설계되어 대규모 트래픽과 데이터에 강하다.",
            "- 조인이 없거나 약해서, 함께 읽는 데이터를 한 문서·한 키에 모아 저장(비정규화)하는 방식으로 모델링한다.",
            "- 많은 제품이 일관성을 일부 양보하고 최종적 일관성(Eventual Consistency)을 택한다.",
            "- 유형: Key-Value, 문서형, 와이드 컬럼, 그래프.",
            "실무에서는 RDB를 기본으로 두고 캐시는 Redis, 검색은 Elasticsearch처럼 용도별로 섞어 쓴다(폴리글랏 퍼시스턴스)."
          ],
          use: ["캐시와 세션은 Redis, 상품 상세는 MongoDB, 채팅 메시지는 Cassandra처럼 용도별로 고른다."],
          myth: [
            [
              "NoSQL은 트랜잭션을 전혀 지원하지 않는다.",
              "MongoDB는 4.0부터 다중 문서 트랜잭션을, DynamoDB도 트랜잭션 API를 지원합니다. 다만 RDB만큼 자유롭지 않고 비용이 큽니다."
            ]
          ],
          answer: "NoSQL은 관계형이 아닌 데이터베이스를 통칭하며, 유연한 스키마와 수평 확장을 중시합니다. 조인 대신 함께 읽을 데이터를 모아 저장하고, 많은 제품이 최종적 일관성을 택합니다. Key-Value, 문서형, 와이드 컬럼, 그래프 유형이 있습니다.",
          qa: [
            "RDB와 NoSQL은 어떤 기준으로 선택하나요?",
            "데이터 관계가 복잡하고 트랜잭션 정합성이 중요하면 RDB를 씁니다. 스키마가 자주 바뀌거나, 조인 없이 키나 문서 단위로 빠르게 읽고 쓰며, 수평 확장이 필요한 대용량 데이터라면 NoSQL을 고려합니다. 실무에서는 핵심 데이터는 RDB에 두고, 캐시나 세션은 Redis처럼 목적에 맞는 NoSQL을 함께 씁니다."
          ],
          followUps: [
            [
              "NoSQL 데이터 모델링은 RDB와 어떻게 다른가요?",
              "RDB는 데이터를 정규화하고 쿼리는 나중에 생각하지만, NoSQL은 어떤 쿼리를 할지 먼저 정하고 그 쿼리가 한 번에 읽히도록 데이터를 비정규화해 저장합니다."
            ]
          ],
          related: ["cs/rdb", "cs/key-value-jeojangso", "cs/munseohyeong-db"]
        },
        {
          id: "cs/key-value-jeojangso",
          slug: "key-value-jeojangso",
          title: "Key-Value 저장소",
          deep: false,
          def: "키 하나로 값을 저장하고 조회하는 가장 단순한 NoSQL이다.",
          why: "세션이나 캐시처럼 키 하나로 빠르게 읽고 쓰면 되는 데이터를 매우 낮은 지연으로 처리하기 위해서다.",
          how: [
            "Redis, Memcached, DynamoDB가 대표적이다. 키로 바로 찾으므로 매우 빠르다.",
            "- Redis는 메모리 기반이며 String, Hash, List, Set, Sorted Set 같은 자료구조를 지원한다.",
            "- 활용: 캐시, 세션 저장소, 랭킹(Sorted Set), 분산 락, 처리율 제한 카운터.",
            "- 값 내부 필드로 검색하거나 조인하는 것은 어렵다."
          ],
          use: ["Redis Sorted Set으로 실시간 랭킹을 만든다.", "Redis `INCR`와 TTL로 IP별 분당 요청 수를 세어 처리율을 제한한다."],
          warn: ["Redis를 유일한 저장소로 쓰면 장애나 재시작 시 데이터를 잃을 수 있다. 영속화 설정(RDB 스냅샷, AOF)과 원본 데이터 위치를 분명히 한다."],
          answer: "Key-Value 저장소는 키 하나로 값을 저장하고 조회하는 가장 단순한 NoSQL로, Redis가 대표적입니다. 키로 바로 찾아 매우 빠르며 캐시, 세션, 랭킹, 분산 락에 씁니다. 값 내부로 검색하거나 조인하기는 어렵습니다.",
          analogy: "번호표 사물함과 같습니다. 번호만 알면 즉시 꺼내지만, 안에 무엇이 있는지로는 찾을 수 없습니다.",
          followUps: [
            [
              "Redis가 싱글 스레드인데 빠른 이유는?",
              "데이터가 메모리에 있고, 명령 실행은 단일 스레드라 락 경쟁이 없으며, I/O 멀티플렉싱으로 많은 연결을 처리합니다. 대신 `KEYS *`처럼 오래 걸리는 명령 하나가 전체를 막으므로 `SCAN`을 씁니다."
            ]
          ],
          related: ["cs/nosql"]
        },
        {
          id: "cs/munseohyeong-db",
          slug: "munseohyeong-db",
          title: "문서형 DB",
          deep: false,
          def: "JSON과 비슷한 문서 단위로 데이터를 저장하는 NoSQL이다.",
          why: "구조가 자주 바뀌거나 중첩된 데이터를 조인 없이 한 문서로 저장하고 조회하기 위해서다.",
          how: [
            "MongoDB가 대표적이다. 문서마다 필드 구성이 달라도 되고, 중첩된 객체와 배열을 그대로 저장한다.",
            "- 함께 읽는 데이터(주문과 주문 상품)를 한 문서에 넣어 조인 없이 한 번에 읽는다.",
            "- 문서 내부 필드에 인덱스를 걸고 질의할 수 있다.",
            "- 활용: 상품 상세처럼 속성이 제각각인 데이터, 콘텐츠 관리, 로그."
          ],
          use: ["카테고리마다 속성이 다른 상품 상세 정보를 문서로 저장한다.", "CMS 콘텐츠나 설정 데이터를 버전별 문서로 관리한다."],
          answer: "문서형 DB는 JSON 같은 문서 단위로 데이터를 저장하는 NoSQL로, MongoDB가 대표적입니다. 문서마다 구조가 달라도 되고 중첩 객체를 그대로 저장해 함께 읽는 데이터를 조인 없이 한 번에 읽습니다.",
          followUps: [
            [
              "문서에 데이터를 넣을지 참조로 나눌지 어떻게 정하나요?",
              "항상 함께 읽고 크기가 제한된 데이터는 문서 안에 넣고, 독립적으로 바뀌거나 무한히 늘어나는 데이터(댓글 수천 개)는 별도 컬렉션으로 나눠 참조합니다. MongoDB 문서는 최대 16MB라는 제한도 있습니다."
            ]
          ],
          related: ["cs/nosql"]
        },
        {
          id: "cs/waideu-keolreom-db",
          slug: "waideu-keolreom-db",
          title: "와이드 컬럼 DB",
          deep: false,
          def: "행 키 아래에 컬럼을 유연하게 늘려 저장하며, 대량 쓰기에 최적화된 NoSQL이다.",
          why: "로그나 시계열처럼 쓰기가 매우 많은 대용량 데이터를 여러 노드에 분산해 처리하기 위해서다.",
          how: [
            "Cassandra, HBase가 대표적이다. 데이터를 파티션 키로 여러 노드에 분산하고, 쓰기를 순차 로그로 처리해 초당 수십만 건 쓰기도 감당한다.",
            "- 조회 패턴에 맞춰 테이블을 설계해야 한다(쿼리 우선 모델링). 파티션 키 없이 하는 조회는 매우 비싸다.",
            "- 활용: 채팅 메시지, IoT 센서 데이터, 시계열 데이터, 활동 로그."
          ],
          use: ["채팅 메시지를 (채팅방 id, 시간) 기준으로 Cassandra에 저장해 최근 메시지를 빠르게 읽는다.", "IoT 센서 측정값을 시간 순으로 대량 저장한다."],
          answer: "와이드 컬럼 DB는 파티션 키로 데이터를 여러 노드에 분산하고 행마다 컬럼을 유연하게 늘려 저장하는 NoSQL로, Cassandra와 HBase가 대표적입니다. 대량 쓰기와 시계열 데이터에 강하지만 조회 패턴에 맞춰 테이블을 설계해야 합니다.",
          followUps: [
            [
              "Cassandra에서 파티션 키를 잘못 정하면?",
              "특정 파티션에 데이터가 몰리는 핫 파티션이 생겨 한 노드만 과부하가 걸리고, 파티션 키 없이 조회하면 모든 노드를 뒤져야 합니다. 고르게 분산되면서 조회 조건에 항상 포함되는 키를 고릅니다."
            ]
          ],
          related: ["cs/nosql", "cs/syading"]
        },
        {
          id: "cs/geuraepeu-db",
          slug: "geuraepeu-db",
          title: "그래프 DB",
          deep: false,
          def: "노드와 관계(간선)를 그대로 저장해 연결 관계 탐색에 특화된 NoSQL이다.",
          why: "친구의 친구나 추천처럼 여러 단계의 관계를 따라가는 조회를 RDB의 반복 조인 없이 빠르게 하기 위해서다.",
          how: [
            "Neo4j가 대표적이다. \"친구의 친구\", \"이 상품을 산 사람이 함께 산 상품\"처럼 여러 단계 관계를 따라가는 질의가 RDB의 반복 조인보다 훨씬 빠르다.",
            "- 활용: 소셜 네트워크, 추천, 사기 탐지(계좌 간 연결), 지식 그래프.",
            "- 저장 구조: 각 노드가 인접한 관계를 직접 가리키는 구조(index-free adjacency)라, 관계를 따라갈 때 인덱스 조회나 조인이 필요 없다.",
            "- 질의 언어: Neo4j는 Cypher로 `MATCH (a:User)-[:FRIEND]->(b)-[:FRIEND]->(c) RETURN c`처럼 패턴을 그리듯 질의한다.",
            "- 한계: 전체 집계, 대량 일괄 갱신, 단순 CRUD는 RDB가 낫다. 관계 탐색이 핵심인 부분에만 함께 쓰는 경우가 많다."
          ],
          use: ["계좌 간 송금 관계를 그래프로 저장해 사기 거래 고리를 탐지한다.", "\"이 상품을 산 사람이 함께 산 상품\" 추천을 만든다."],
          answer: "그래프 DB는 노드와 관계를 그대로 저장해 여러 단계의 연결을 따라가는 질의에 특화된 NoSQL로, Neo4j가 대표적입니다. 친구의 친구나 추천처럼 RDB에서 조인을 반복해야 하는 탐색이 훨씬 빠릅니다.",
          analogy: "지하철 노선도처럼 역과 연결선을 그대로 저장해 두고 경로를 따라가는 것과 같습니다.",
          followUps: [
            [
              "RDB로 친구의 친구를 찾으면 왜 느린가요?",
              "단계마다 친구 테이블을 SELF JOIN해야 해 깊이가 늘수록 조인 결과가 기하급수적으로 커집니다. 그래프 DB는 노드마다 연결된 관계를 직접 따라가므로 탐색 범위만큼만 비용이 듭니다."
            ]
          ],
          related: ["cs/nosql"]
        }
      ]
    },
    {
      name: "확장 · 성능",
      compare: {
        cols: ["기준", "레플리케이션", "샤딩"],
        rows: [
          ["데이터", "같은 데이터를 복사", "데이터를 나눠 저장"],
          ["분산 대상", "읽기", "읽기와 쓰기"],
          ["주의점", "복제 지연", "샤드 간 조인·트랜잭션 어려움"],
          ["도입 난이도", "비교적 쉬움", "어려움(마지막 수단)"]
        ]
      },
      concepts: [
        {
          id: "cs/repeulrikeisyeon",
          slug: "repeulrikeisyeon",
          title: "레플리케이션",
          deep: false,
          def: "원본(Primary) DB의 변경을 복제본(Replica) DB로 계속 복사해 같은 데이터를 여러 서버에 두는 것이다.",
          why: "읽기 부하를 여러 서버로 분산하고, 주 서버 장애 시에도 데이터와 서비스를 유지하기 위해서다.",
          how: [
            "Primary가 변경 내용을 로그(MySQL은 binlog)에 남기면 Replica가 이를 받아 똑같이 적용한다.",
            "- 읽기 분산: 쓰기는 Primary, 읽기는 여러 Replica로 보내 읽기 부하를 나눈다. 스프링에서는 `@Transactional(readOnly = true)`와 라우팅 DataSource로 구현한다.",
            "- 고가용성: Primary가 죽으면 Replica를 승격(failover)한다.",
            "- 백업, 분석용 쿼리를 Replica에서 실행해 운영 DB 부담을 줄인다."
          ],
          flow: ["Primary에서 쓰기 커밋", "binlog에 변경 기록", "Replica가 binlog 수신", "Replica에서 같은 변경 적용"],
          use: [
            "`@Transactional(readOnly = true)` 조회는 Replica로, 쓰기는 Primary로 라우팅한다.",
            "리포트·통계 쿼리를 전용 Replica에서 실행해 운영 DB를 보호한다."
          ],
          warn: ["비동기 복제는 복제 지연이 있다. 글을 쓰고 바로 Replica에서 읽으면 방금 쓴 글이 안 보일 수 있으므로, 쓰기 직후 조회는 Primary에서 읽는다."],
          myth: [
            [
              "Replica가 있으면 백업은 필요 없다.",
              "실수로 DELETE하면 Replica에도 그대로 복제됩니다. 특정 시점으로 되돌리려면 별도 백업과 binlog가 필요합니다."
            ]
          ],
          answer: "레플리케이션은 Primary DB의 변경을 Replica로 계속 복사해 같은 데이터를 여러 서버에 두는 것입니다. 읽기를 Replica로 분산하고 장애 시 Replica를 승격하는 데 쓰며, 비동기 복제라 복제 지연이 있어 쓰기 직후 조회는 Primary에서 읽습니다.",
          analogy: "원본 문서를 여러 부 복사해 여러 창구에서 동시에 열람하게 하는 것과 같습니다. 원본이 고쳐지면 사본에는 조금 늦게 반영됩니다.",
          followUps: [
            [
              "복제 지연 때문에 글을 쓰고 목록에 안 보이면 어떻게 하나요?",
              "쓰기 직후 일정 시간이나 같은 요청 흐름에서는 Primary에서 읽게 하거나, 작성 결과를 응답으로 바로 돌려줘 화면에 반영합니다. 반준동기 복제로 지연을 줄이는 방법도 있습니다."
            ]
          ],
          related: ["cs/syading", "cs/jisokseong"]
        },
        {
          id: "cs/syading",
          slug: "syading",
          title: "샤딩",
          deep: false,
          def: "데이터를 특정 키 기준으로 나눠 여러 DB 서버에 분산 저장하는 수평 분할이다.",
          why: "데이터와 쓰기 부하가 서버 한 대의 용량을 넘을 때 여러 DB로 나눠 수평 확장하기 위해서다.",
          how: [
            "레플리케이션은 같은 데이터를 복사해 읽기만 분산하지만, 샤딩은 데이터 자체를 나눠 쓰기까지 분산한다.",
            "- 해시 샤딩: `user_id % 4`처럼 해시로 샤드를 정한다. 고르게 퍼지지만 샤드를 늘리면 재배치가 크다(일관된 해싱으로 완화).",
            "- 범위 샤딩: id 1~100만은 샤드 1처럼 범위로 나눈다. 범위 조회는 쉽지만 최근 데이터가 한 샤드에 몰리기 쉽다.",
            "- 디렉터리 샤딩: 키와 샤드의 매핑 테이블을 따로 둔다."
          ],
          use: ["회원 id 해시로 4개 샤드에 나누고, 같은 회원의 데이터는 같은 샤드에 둬 조인을 피한다."],
          warn: ["샤드를 넘는 조인, 트랜잭션, 전체 정렬·집계가 어려워진다. 인덱스·캐시·읽기 복제로 해결되지 않을 때 마지막에 고려한다."],
          answer: "샤딩은 데이터를 키 기준으로 나눠 여러 DB 서버에 분산 저장하는 수평 분할로, 레플리케이션과 달리 쓰기까지 분산합니다. 해시, 범위, 디렉터리 방식이 있으며, 샤드를 넘는 조인과 트랜잭션이 어려워 마지막 수단으로 씁니다.",
          analogy: "한 도서관이 넘쳐 책을 저자 성씨별로 여러 분관에 나눠 보관하는 것과 같습니다.",
          followUps: [
            [
              "샤드를 늘릴 때 데이터 이동을 줄이는 방법은?",
              "`id % N` 방식은 N이 바뀌면 대부분 데이터가 이동합니다. 일관된 해싱이나 많은 가상 샤드를 미리 만들어 물리 서버에 배치해 두면 서버를 추가할 때 일부만 옮기면 됩니다."
            ],
            [
              "샤딩하면 id 생성은 어떻게 하나요?",
              "샤드마다 자동 증가를 쓰면 id가 겹치므로 Snowflake처럼 시간·서버 번호·순번을 조합한 분산 id나 시간 순서 UUID를 씁니다."
            ]
          ],
          related: ["cs/repeulrikeisyeon", "cs/rdb"]
        },
        {
          id: "cs/keoseo-giban-peijing",
          slug: "keoseo-giban-peijing",
          title: "커서 기반 페이징",
          deep: false,
          def: "OFFSET 대신 마지막으로 본 행의 키를 기준으로 다음 페이지를 조회하는 페이징 방식(no-offset)이다.",
          why: "OFFSET 페이징은 뒤 페이지로 갈수록 앞의 행을 모두 읽고 버려 느려지므로, 마지막 위치부터 바로 읽기 위해서다.",
          how: [
            "`LIMIT 20 OFFSET 100000`은 앞의 10만 행을 읽고 버린 뒤 20행을 반환하므로 뒤 페이지로 갈수록 느려진다.",
            "커서 방식은 `WHERE id < :lastId ORDER BY id DESC LIMIT 20`처럼 인덱스로 시작 위치를 바로 찾으므로 몇 번째 페이지든 속도가 같다.",
            "- 무한 스크롤, 피드, 대용량 배치 처리에 맞다.",
            "- 특정 페이지 번호로 바로 이동하는 UI는 만들기 어렵다.",
            "- 정렬 키가 중복될 수 있으면 `(created_at, id)`처럼 고유한 조합을 커서로 쓴다."
          ],
          flow: ["첫 페이지 조회", "응답에 마지막 id 전달", "다음 요청에 커서 포함", "WHERE id < 커서로 조회"],
          code: "-- OFFSET 방식: 뒤로 갈수록 느려짐\nSELECT * FROM post ORDER BY id DESC LIMIT 20 OFFSET 100000;\n\n-- 커서 방식: 마지막으로 본 id 기준\nSELECT * FROM post WHERE id < 873421 ORDER BY id DESC LIMIT 20;",
          codeLang: "sql",
          use: [
            "SNS 피드와 무한 스크롤 API를 `?cursor=873421&size=20` 형태로 만든다.",
            "수백만 건 배치 처리에서 id 커서로 끊어 읽어 메모리와 시간을 일정하게 유지한다."
          ],
          myth: [["OFFSET도 인덱스가 있으면 빠르다.", "인덱스가 있어도 OFFSET만큼의 행을 실제로 읽고 버리므로 페이지가 깊어질수록 선형으로 느려집니다."]],
          answer: "커서 기반 페이징은 OFFSET 대신 마지막으로 본 행의 키를 기준으로 다음 페이지를 조회합니다. OFFSET은 앞 행을 모두 읽고 버려 뒤로 갈수록 느려지지만, 커서는 인덱스로 시작 위치를 바로 찾아 어느 페이지든 속도가 같습니다. 대신 특정 페이지 번호로 바로 이동하기는 어렵습니다.",
          analogy: "책을 처음부터 100쪽을 세는 대신, 꽂아 둔 책갈피부터 이어 읽는 것과 같습니다.",
          followUps: [
            [
              "정렬 기준이 created_at이라 중복될 수 있으면 커서를 어떻게 만드나요?",
              "`(created_at, id)`처럼 고유한 조합을 커서로 쓰고 `WHERE (created_at, id) < (?, ?)` 조건과 같은 순서의 복합 인덱스를 둡니다. 그래야 같은 시각의 행이 누락되거나 중복되지 않습니다."
            ]
          ],
          related: ["cs/keobeoring-indekseu", "cs/indekseu"]
        }
      ]
    }
  ]
};

export default topic;
