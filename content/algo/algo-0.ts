import type { Topic } from '../types';

const topic: Topic = {
  key: "algo-0",
  name: "복잡도 · 기초",
  must: [
    "자바는 1초에 단순 연산 약 10^8번으로 잡고, 입력 제한 N으로 허용 복잡도부터 역산한다.",
    "반복문 안의 `contains`, `remove(0)`, `substring`, 문자열 `+`는 숨은 O(N)이다.",
    "자바는 꼬리 호출 최적화가 없다. 깊이 10^4 이상 재귀는 명시적 스택이나 큰 스택 스레드로 바꾼다.",
    "분할 정복은 부분 문제가 겹치지 않을 때, 겹치면 DP로 푼다."
  ],
  groups: [
    {
      name: "복잡도 분석",
      compare: {
        cols: ["기준", "Big-O 표기법", "시간 복잡도 계산", "공간 복잡도", "상환 분석"],
        rows: [
          ["묻는 것", "증가율을 나타내는 방법", "코드의 연산 횟수", "추가 메모리 사용량", "연산 여러 번의 평균 비용"],
          ["대표 예", "O(N log N)", "조화급수 → O(N log N)", "DP 테이블 O(N²)", "ArrayList.add 상환 O(1)"],
          ["흔한 실수", "평균과 최악 혼동", "숨은 O(N) 라이브러리 호출 누락", "재귀 스택 공간 누락", "평균 복잡도와 혼동"]
        ]
      },
      concepts: [
        {
          id: "algo/big-o-pyogibeop",
          slug: "big-o-pyogibeop",
          title: "Big-O 표기법",
          deep: true,
          def: "입력 크기 N이 커질 때 알고리즘의 연산 횟수가 늘어나는 정도를, 가장 큰 항만 남기고 상수를 버려 나타내는 점근 표기법이다.",
          why: "같은 문제를 푸는 코드라도 N이 커지면 속도 차이가 수천 배로 벌어진다. 실행해 보기 전에 시간 안에 끝날지 판단하려면 하드웨어와 상관없는 공통 척도가 필요하다.",
          how: [
            "연산 횟수를 N의 식으로 쓰고, 가장 빨리 커지는 항만 남긴 뒤 계수를 버린다. `3N² + 10N + 5`는 O(N²)이다.",
            "- O(1): 배열 인덱스 접근, 해시 조회(평균).",
            "- O(log N): 이분 탐색, 균형 트리 조회, 힙 삽입·삭제.",
            "- O(N): 배열 한 번 훑기.",
            "- O(N log N): 병합 정렬, 힙 정렬, `Arrays.sort`.",
            "- O(N²): 이중 반복문, 버블·삽입 정렬.",
            "- O(2^N): 부분집합 전부 탐색. O(N!): 순열 전부 탐색.",
            "Big-O는 상한(최악), Big-Ω는 하한(최선), Big-Θ는 상한과 하한이 같을 때의 정확한 증가율이다. 실무와 면접에서 \"O(N)\"이라고 하면 보통 최악 또는 평균의 Θ를 뜻한다.",
            "상수를 버리므로 N이 작을 때는 O(N²) 삽입 정렬이 O(N log N) 퀵 정렬보다 빠를 수 있다. TimSort가 작은 구간에 삽입 정렬을 쓰는 이유다."
          ],
          code: "// O(1)\nint first = arr[0];\n\n// O(N)\nint sum = 0;\nfor (int x : arr) sum += x;\n\n// O(N²)\nfor (int i = 0; i < n; i++)\n    for (int j = i + 1; j < n; j++)\n        if (arr[i] + arr[j] == target) count++;\n\n// O(log N)\nint idx = Arrays.binarySearch(sorted, target);",
          codeLang: "java",
          use: [
            "문제를 읽자마자 입력 제한과 떠올린 풀이의 Big-O를 곱해 보고 10^8을 넘으면 다른 풀이를 찾는다.",
            "코드 리뷰나 면접 코딩에서 풀이 설명 마지막에 시간·공간 복잡도를 함께 말한다."
          ],
          warn: [
            "해시 조회 O(1)은 평균이다. 충돌이 몰리면 최악 O(N)이고, 자바 HashMap은 버킷이 커지면 트리로 바꿔 O(log N)으로 막는다.",
            "퀵 정렬은 평균 O(N log N)이지만 최악 O(N²)이다. 평균과 최악을 구분해 말한다."
          ],
          myth: [
            [
              "O(1)이 항상 O(log N)보다 빠르다.",
              "상수가 크면 작은 N에서는 O(log N)이 더 빠를 수 있다. HashMap 조회가 작은 정렬 배열의 이분 탐색보다 느린 경우도 있다."
            ],
            [
              "Big-O는 최악의 경우만 뜻한다.",
              "Big-O는 상한을 나타내는 표기일 뿐이고, 최악·평균·최선 어느 경우에도 붙일 수 있다. 퀵 정렬은 평균 O(N log N), 최악 O(N²)이다."
            ]
          ],
          answer: "Big-O는 입력 크기 N이 커질 때 연산 횟수가 얼마나 빨리 늘어나는지를 가장 큰 항만 남기고 상수를 버려 나타낸 표기법입니다. O(1), O(log N), O(N), O(N log N), O(N²), O(2^N) 순으로 느려지고, 이를 기준으로 하드웨어와 상관없이 알고리즘의 확장성을 비교합니다.",
          analogy: "택배 배송 시간을 \"트럭 속도\"가 아니라 \"상자 수가 두 배가 되면 시간이 몇 배가 되나\"로 비교하는 것과 같습니다. 트럭이 빨라져도 그 비율은 바뀌지 않습니다.",
          qa: [
            "Big-O 표기법이 무엇이고 왜 상수를 버리나요?",
            "Big-O는 입력 크기가 커질 때 연산 횟수가 증가하는 정도를 가장 큰 항으로만 나타낸 표기법입니다. N이 충분히 커지면 증가율이 가장 큰 항이 전체 실행 시간을 지배하고, 상수 배는 하드웨어나 언어에 따라 달라지므로 알고리즘 자체의 확장성을 비교할 때는 버립니다. 다만 N이 작을 때는 상수가 실제 속도를 좌우할 수 있습니다."
          ],
          followUps: [
            [
              "O(N)과 O(2N)은 다른가요?",
              "점근 표기에서는 같은 O(N)입니다. 상수 배는 버리기 때문입니다. 다만 실제 실행 시간은 두 배 차이가 나므로, 시간 제한이 빠듯할 때는 상수도 신경 씁니다."
            ],
            [
              "O(log N)에서 로그의 밑은 왜 안 쓰나요?",
              "밑이 다른 로그끼리는 상수 배 차이만 나기 때문입니다. log₂N = log₁₀N / log₁₀2라서 Big-O에서는 구분하지 않습니다."
            ]
          ],
          related: ["algo/sigan-bokjapdo-gyesan", "algo/gonggan-bokjapdo", "algo/ipryeok-keugiro-algorijeum-goreugi"]
        },
        {
          id: "algo/sigan-bokjapdo-gyesan",
          slug: "sigan-bokjapdo-gyesan",
          title: "시간 복잡도 계산",
          deep: true,
          def: "코드의 반복문, 재귀 호출, 라이브러리 호출을 따라가며 입력 크기에 대한 총 연산 횟수를 세는 과정이다.",
          why: "문제를 풀기 전에 떠올린 풀이가 제한 시간 안에 끝나는지 계산할 수 있어야 시간 초과를 미리 피할 수 있다.",
          how: [
            "- 순차 실행: 더한다. O(N) 다음 O(N²)이면 O(N²).",
            "- 중첩 반복: 곱한다. 바깥 N번 × 안쪽 M번이면 O(NM).",
            "- 반으로 줄어드는 반복: `i *= 2`, `lo..hi` 절반씩은 O(log N).",
            "- 안쪽 반복이 바깥 변수에 의존: `j = i..n`이면 N + (N-1) + ... + 1 = N(N+1)/2 → O(N²).",
            "- 조화급수: `for i in 1..N, for j = i; j <= N; j += i`는 N/1 + N/2 + ... = O(N log N). 에라토스테네스의 체가 이 꼴이다.",
            "- 재귀: 호출 횟수 × 호출당 작업. 피보나치 단순 재귀는 호출이 두 갈래로 퍼져 O(2^N), 메모이제이션하면 O(N).",
            "- 분할 정복: `T(N) = 2T(N/2) + O(N)`은 깊이 log N × 층마다 N = O(N log N)(마스터 정리).",
            "- 라이브러리 비용 포함: `list.contains`는 O(N), `list.remove(0)`은 O(N), `String +=`은 매번 복사라 반복문 안에서 O(N²)이 된다."
          ],
          flow: ["반복문·재귀 구조 파악", "각 반복 횟수를 N으로 표현", "중첩은 곱하고 순차는 더함", "라이브러리 호출 비용 포함", "최고차항만 남김"],
          code: "// O(N log N): 조화급수 꼴 (약수 개수 세기)\nint[] divCnt = new int[n + 1];\nfor (int i = 1; i <= n; i++)\n    for (int j = i; j <= n; j += i)\n        divCnt[j]++;\n\n// 숨은 O(N²): 반복문 안 ArrayList.remove(0)\nList<Integer> q = new ArrayList<>(list);\nwhile (!q.isEmpty()) q.remove(0);   // 매번 앞당김 → O(N²)\nDeque<Integer> dq = new ArrayDeque<>(list);\nwhile (!dq.isEmpty()) dq.poll();    // O(N)",
          codeLang: "java",
          use: [
            "풀이가 시간 초과 났을 때 반복문 안의 `list.contains`나 `String +` 같은 숨은 O(N)을 먼저 찾는다.",
            "에라토스테네스의 체, 약수 개수 세기처럼 이중 반복이지만 O(N log N)인 패턴을 알아 두면 불필요하게 다른 풀이를 찾지 않는다."
          ],
          warn: [
            "반복문 안의 `contains`, `indexOf`, `substring`, 문자열 `+`는 숨은 O(N)이다. 전체 복잡도에 곱해서 센다.",
            "\"반복문이 두 개면 O(N²)\"은 틀릴 수 있다. 투 포인터처럼 두 포인터가 각각 한 방향으로만 움직이면 합쳐서 O(N)이다."
          ],
          myth: [
            [
              "반복문이 두 겹이면 무조건 O(N²)이다.",
              "투 포인터나 조화급수 꼴처럼 안쪽 반복의 총합이 작으면 O(N)이나 O(N log N)이다. 실제 총 반복 횟수를 세야 한다."
            ]
          ],
          answer: "시간 복잡도는 순차 실행은 더하고, 중첩 반복은 곱하고, 절반씩 줄어드는 반복은 log로 셉니다. 안쪽 반복 횟수가 바깥 변수에 따라 바뀌면 실제로 합을 구하고, 재귀는 호출 횟수에 호출당 작업을 곱하며, 반복문 안 라이브러리 호출의 비용도 함께 곱합니다.",
          qa: [
            "다음 코드의 시간 복잡도를 어떻게 구하나요? (i를 1부터 N까지, j를 i부터 N까지 i씩 증가)",
            "안쪽 반복은 i마다 N/i번 돕니다. 그래서 전체 횟수는 N/1 + N/2 + ... + N/N = N × (1 + 1/2 + ... + 1/N)이고, 괄호 안이 조화급수로 약 ln N이므로 O(N log N)입니다. 반복문이 중첩됐다고 무조건 O(N²)이 아니라 안쪽 반복 횟수를 실제로 합해 봐야 합니다."
          ],
          followUps: [
            [
              "재귀 피보나치의 시간 복잡도는요?",
              "호출마다 두 번씩 다시 호출하므로 호출 트리가 거의 2^N개 노드로 퍼져 O(2^N)입니다. 정확히는 황금비의 N제곱입니다. 메모이제이션을 쓰면 각 값을 한 번만 계산하므로 O(N)이 됩니다."
            ],
            [
              "마스터 정리는 언제 쓰나요?",
              "T(N) = aT(N/b) + f(N) 꼴의 분할 정복 점화식을 풀 때 씁니다. 병합 정렬처럼 a=2, b=2, f(N)=N이면 층마다 N씩 log N층이라 O(N log N)입니다."
            ]
          ],
          related: ["algo/big-o-pyogibeop", "algo/bunhal-jeongbok", "algo/tu-pointeo", "algo/sigan-chogwa-dibeoging"]
        },
        {
          id: "algo/gonggan-bokjapdo",
          slug: "gonggan-bokjapdo",
          title: "공간 복잡도",
          deep: false,
          def: "알고리즘이 실행되는 동안 입력 외에 추가로 쓰는 메모리가 입력 크기에 따라 늘어나는 정도다.",
          how: [
            "- 보조 배열·컬렉션: 크기 N의 배열이면 O(N), N×N DP 테이블이면 O(N²).",
            "- 재귀 호출 스택: 재귀 깊이만큼 스택 프레임이 쌓인다. 깊이 N의 DFS는 O(N).",
            "- 메모리 제한 감각: `int`는 4바이트라 `int[10^7]`이 약 40MB, `long[10^7]`은 약 80MB다. 256MB 제한이면 `int` 약 6천만 개가 한계다.",
            "- 2차원 배열은 행마다 객체라 오버헤드가 있다. `int[5000][5000]`은 약 100MB다.",
            "- DP 공간 최적화: 이전 행만 쓰는 점화식은 2행(롤링 배열)이나 1차원으로 줄여 O(N²) → O(N)으로 만든다.",
            "시간과 공간은 맞바꿀 수 있다. 메모이제이션·해시는 메모리를 써서 시간을 줄이고, 매번 다시 계산하면 메모리는 아끼지만 느리다."
          ],
          code: "// 0/1 배낭: 2차원 dp[i][w] → 1차원으로 공간 O(W)\nint[] dp = new int[W + 1];\nfor (int i = 0; i < n; i++)\n    for (int w = W; w >= weight[i]; w--)   // 뒤에서부터 돌아야 같은 물건을 두 번 안 쓴다\n        dp[w] = Math.max(dp[w], dp[w - weight[i]] + value[i]);",
          codeLang: "java",
          use: [
            "메모리 제한 256MB 문제에서 `int` 배열 하나에 최대 약 6천만 칸이라는 감각으로 DP 테이블 크기를 미리 계산한다.",
            "배낭 문제나 LCS에서 메모리 초과가 나면 2차원 테이블을 1차원 또는 2행으로 줄인다."
          ],
          warn: [
            "`Integer`, `Long` 박싱 객체는 하나에 16바이트 이상이다. `List<Integer>` 천만 개는 `int[]`보다 몇 배 무겁다.",
            "재귀 깊이가 10^5를 넘으면 메모리 제한보다 먼저 `StackOverflowError`가 난다."
          ],
          myth: [["재귀는 추가 메모리를 쓰지 않는다.", "호출마다 스택 프레임이 쌓이므로 재귀 깊이만큼 O(깊이) 공간을 쓴다."]],
          answer: "공간 복잡도는 입력 외에 추가로 쓰는 메모리가 N에 따라 얼마나 늘어나는지입니다. 보조 배열과 컬렉션뿐 아니라 재귀 호출 스택도 포함하고, DP처럼 이전 행만 필요하면 롤링 배열로 O(N²)을 O(N)으로 줄일 수 있습니다.",
          followUps: [
            [
              "시간과 공간 중 무엇을 우선하나요?",
              "코딩테스트는 보통 시간 제한이 더 빡빡해서 메모리를 써서 시간을 줄이는 쪽(메모이제이션, 해시, 누적합)을 먼저 택합니다. 메모리 제한에 걸리면 그때 롤링 배열 같은 공간 최적화를 합니다."
            ]
          ],
          related: [
            "algo/big-o-pyogibeop",
            "algo/jaegwiwa-hochul-seutaek",
            "algo/0-1-baenang-munje",
            "algo/memoijeisyeon"
          ]
        },
        {
          id: "algo/sanghwan-bunseok",
          slug: "sanghwan-bunseok",
          title: "상환 분석",
          deep: false,
          def: "가끔 비싼 연산이 섞여 있어도 연산 여러 번에 걸친 총비용을 횟수로 나누면 연산 하나당 평균 비용이 작다는 것을 보이는 분석 방법이다.",
          how: [
            "평균 복잡도(입력 분포에 대한 기댓값)와 다르다. 상환 분석은 최악의 연산 순서에서도 성립하는 보장이다.",
            "- 동적 배열(ArrayList): 꽉 차면 1.5배(자바)로 늘리며 전체를 복사해 O(N)이지만, N번 add의 총 복사 비용이 O(N)이라 add 한 번은 상환 O(1)이다.",
            "- 모노토닉 스택: 원소마다 push 한 번, pop 최대 한 번이라 안쪽 while이 있어도 전체 O(N)이다.",
            "- 투 포인터·슬라이딩 윈도우: 각 포인터가 최대 N번 움직이므로 전체 O(N).",
            "- 유니온 파인드: 경로 압축 + 랭크 합치기면 연산당 상환 O(α(N)), 사실상 상수다."
          ],
          code: "// 오큰수(다음 큰 원소): while이 있어도 원소마다 push/pop 각 1번 → 상환 O(N)\nint[] ans = new int[n];\nArrays.fill(ans, -1);\nDeque<Integer> st = new ArrayDeque<>();\nfor (int i = 0; i < n; i++) {\n    while (!st.isEmpty() && arr[st.peek()] < arr[i]) ans[st.pop()] = arr[i];\n    st.push(i);\n}",
          codeLang: "java",
          use: ["while이 들어간 for문이 O(N²)처럼 보여도 원소마다 처리가 한 번뿐이면 O(N)이라고 판단해 오큰수, 히스토그램 최대 직사각형 같은 스택 풀이를 쓴다."],
          warn: ["상환 O(1)이어도 한 번의 연산은 O(N)일 수 있다. 응답 시간이 일정해야 하는 실시간 시스템에서는 최악 한 번의 비용도 본다."],
          myth: [
            [
              "상환 O(1)은 평균 O(1)과 같은 말이다.",
              "평균 복잡도는 입력 분포에 대한 기댓값이고, 상환 분석은 최악의 연산 순서에서도 성립하는 총합 보장이다. 해시 평균 O(1)은 운이 나쁘면 깨지지만 ArrayList 상환 O(1)은 항상 성립한다."
            ]
          ],
          answer: "상환 분석은 가끔 비싼 연산이 있어도 연산 여러 번의 총비용을 횟수로 나눈 평균이 작음을 보이는 방법입니다. ArrayList는 꽉 차면 전체를 복사하지만 N번 add의 총 복사 비용이 O(N)이라 add 한 번은 상환 O(1)이고, 모노토닉 스택도 원소마다 push와 pop이 한 번씩이라 전체 O(N)입니다.",
          analogy: "월세를 한 번에 큰돈으로 내도 매일로 나누면 하루 비용은 작은 것과 같습니다. 가끔 큰 지출이 있어도 기간 전체로 나눈 평균이 보장됩니다.",
          followUps: [
            [
              "ArrayList가 두 배(자바는 1.5배)씩 늘리는 이유는요?",
              "일정 비율로 늘려야 복사 총량이 등비급수로 O(N)에 묶여 add가 상환 O(1)이 됩니다. 한 칸씩 늘리면 add마다 전체를 복사해 N번 add가 O(N²)이 됩니다."
            ]
          ],
          related: ["algo/big-o-pyogibeop", "algo/tu-pointeo", "algo/seulraiding-windou", "algo/yunion-paindeu"]
        }
      ]
    },
    {
      name: "입력 크기와 선택",
      compare: {
        cols: ["입력 크기 N", "허용 복잡도", "대표 풀이"],
        rows: [
          ["N ≤ 10", "O(N!)", "순열 완전 탐색, 백트래킹"],
          ["N ≤ 20", "O(2^N × N)", "부분집합 탐색, 비트마스크 DP"],
          ["N ≤ 500", "O(N³)", "플로이드-워셜, 구간 DP"],
          ["N ≤ 5,000", "O(N²)", "이중 반복, LCS 같은 2차원 DP"],
          ["N ≤ 10^6", "O(N log N)", "정렬, 이분 탐색, 힙, 세그먼트 트리"],
          ["N ≤ 10^8", "O(N)", "투 포인터, 누적합, 한 번 훑기"],
          ["N ≤ 10^18", "O(log N)", "파라메트릭 서치, 빠른 거듭제곱, 수식"]
        ]
      },
      concepts: [
        {
          id: "algo/ipryeok-keugiro-algorijeum-goreugi",
          slug: "ipryeok-keugiro-algorijeum-goreugi",
          title: "입력 크기로 알고리즘 고르기",
          deep: true,
          def: "문제의 입력 제한 N과 시간 제한을 보고 허용되는 시간 복잡도를 역산해, 그 복잡도에 맞는 알고리즘 후보를 좁히는 방법이다.",
          why: "코딩테스트 문제는 입력 제한이 사실상 의도한 풀이의 힌트다. 풀이를 떠올리기 전에 허용 복잡도부터 정하면 시간 초과 나는 풀이에 시간을 쓰지 않는다.",
          how: [
            "기준: 자바에서 단순 연산은 1초에 약 10^8번(보수적으로 5×10^7번)이라고 잡는다.",
            "- N ≤ 10: O(N!) 가능. 순열 완전 탐색, 백트래킹.",
            "- N ≤ 20: O(2^N), O(2^N × N). 부분집합 완전 탐색, 비트마스크 DP.",
            "- N ≤ 100: O(N^4)까지.",
            "- N ≤ 500: O(N³). 플로이드-워셜, 구간 DP.",
            "- N ≤ 5,000: O(N²). 이중 반복, 2차원 DP(LCS 등).",
            "- N ≤ 100,000 ~ 1,000,000: O(N log N). 정렬, 이분 탐색, 힙, 세그먼트 트리, 다익스트라.",
            "- N ≤ 10^7 ~ 10^8: O(N). 투 포인터, 누적합, 한 번 훑기.",
            "- N ≤ 10^18: O(log N) 또는 O(1). 이분 탐색(파라메트릭), 분할 정복 거듭제곱, 수학 공식.",
            "여러 테스트 케이스가 있으면 전체 입력 합에 대한 제한(예: N의 합 ≤ 2×10^5)을 기준으로 계산한다."
          ],
          flow: ["입력 제한 N 확인", "허용 복잡도 역산", "그 복잡도의 후보 알고리즘 나열", "문제 조건과 맞는 후보 선택", "최악 입력으로 연산 횟수 검산"],
          code: "// N ≤ 20 → 부분집합 2^20 ≈ 100만: 완전 탐색 가능\nfor (int mask = 0; mask < (1 << n); mask++) {\n    long sum = 0;\n    for (int i = 0; i < n; i++) if ((mask & (1 << i)) != 0) sum += arr[i];\n    if (sum == target) count++;\n}\n\n// N ≤ 10^5, 쌍의 합 = target 개수 → O(N²)=10^10 불가, 정렬 + 투 포인터 O(N log N)\nArrays.sort(arr);\nint l = 0, r = n - 1;\nwhile (l < r) {\n    int s = arr[l] + arr[r];\n    if (s == target) { count++; l++; r--; }\n    else if (s < target) l++;\n    else r--;\n}",
          codeLang: "java",
          use: [
            "N ≤ 15인 문제에서 DP 점화식을 고민하기 전에 2^15 완전 탐색이나 비트마스크 DP가 의도인지 먼저 의심한다.",
            "N ≤ 2×10^5 문제에서 O(N²) 풀이가 떠오르면 정렬, 투 포인터, 누적합, 힙으로 줄일 방법을 찾는다."
          ],
          warn: [
            "경계에 걸친 복잡도(N=5000에 O(N² log N))는 상수와 언어에 따라 통과 여부가 갈린다. 자바는 C++보다 2~3배 여유를 두고 판단한다.",
            "값의 범위 제한도 힌트다. 값이 10^9까지면 합이 `int`를 넘으니 `long`, 값이 작으면 계수 정렬이나 값 인덱스 배열을 쓸 수 있다."
          ],
          myth: [
            [
              "C++ 기준 표를 자바에 그대로 써도 된다.",
              "자바는 JVM 기동과 객체 오버헤드 때문에 같은 복잡도에서도 2~3배 느릴 수 있다. 경계에 걸린 풀이는 상수를 줄이거나 한 단계 낮은 복잡도를 찾는다."
            ]
          ],
          answer: "자바에서 1초에 단순 연산 약 10^8번으로 잡고, 입력 제한 N에서 허용 복잡도를 역산합니다. N이 20 이하면 2^N 완전 탐색, 5천 이하면 O(N²), 10만~100만이면 O(N log N), 10^18이면 O(log N)인 이분 탐색이나 수식을 떠올립니다. 입력 제한이 사실상 의도한 풀이의 힌트입니다.",
          qa: [
            "입력이 N ≤ 100,000일 때 어떤 풀이를 먼저 떠올리나요?",
            "O(N²)이면 10^10번이라 시간 안에 끝나지 않으므로 O(N log N) 이하 풀이를 찾습니다. 정렬 후 투 포인터나 이분 탐색, 힙이나 TreeMap 같은 로그 자료구조, 누적합, 세그먼트 트리, 그래프라면 BFS나 다익스트라를 후보로 놓고 문제 조건에 맞는 것을 고릅니다."
          ],
          followUps: [
            [
              "테스트 케이스가 T개 주어지면 어떻게 계산하나요?",
              "문제에 \"모든 테스트 케이스의 N의 합 ≤ X\" 조건이 있으면 X를 기준으로, 없으면 T × (케이스당 연산 횟수)를 계산합니다. 매 케이스마다 큰 배열을 새로 초기화하면 그것만으로 시간 초과가 날 수 있어 필요한 크기만 초기화합니다."
            ],
            [
              "N이 10^18처럼 매우 크면 어떤 풀이를 떠올리나요?",
              "배열로 담을 수 없으니 O(log N)이나 O(1)이어야 합니다. 답을 정해 놓고 가능 여부를 묻는 파라메트릭 서치, 빠른 거듭제곱, 행렬 거듭제곱, 수학 공식이나 규칙 찾기를 후보로 봅니다."
            ]
          ],
          related: [
            "algo/big-o-pyogibeop",
            "algo/jaba-yeonsan-sokdo-gamgak",
            "algo/munje-yuhyeong-panbyeol-sinho",
            "algo/wanjeon-tamsaek",
            "algo/parameteurik-seochi"
          ]
        },
        {
          id: "algo/jaba-yeonsan-sokdo-gamgak",
          slug: "jaba-yeonsan-sokdo-gamgak",
          title: "자바 연산 속도 감각",
          deep: false,
          def: "자바에서 어떤 연산과 자료구조가 상수 배로 얼마나 비싼지 알고, 같은 복잡도 안에서도 느린 선택을 피하는 감각이다.",
          how: [
            "- 1초 ≈ 단순 연산 10^8번. JVM 기동·JIT 워밍업 때문에 첫 실행 구간은 더 느리다.",
            "- 원시 배열 `int[]`가 `ArrayList<Integer>`보다 몇 배 빠르다. 박싱·언박싱과 캐시 지역성 때문이다.",
            "- `HashMap` 조회는 O(1)이지만 해시 계산과 박싱 때문에 배열 인덱싱보다 수십 배 느리다. 키 범위가 작으면 배열로 바꾼다.",
            "- `TreeMap`·`PriorityQueue`는 O(log N)이지만 객체 비교 비용이 크다.",
            "- 입출력: `Scanner`와 `System.out.println` 반복은 입력 10^5 이상에서 그것만으로 시간 초과가 난다. `BufferedReader`와 `StringBuilder`를 쓴다.",
            "- 문자열: `String +=`은 매번 새 객체라 반복문에서는 `StringBuilder`.",
            "- 재귀는 반복문보다 호출 오버헤드가 있고 깊으면 스택이 넘친다."
          ],
          code: "// 값 범위가 0..10^6이면 HashMap 대신 배열로 빈도 세기\nint[] freq = new int[1_000_001];\nfor (int x : arr) freq[x]++;\n\n// 출력 모아서 한 번에\nStringBuilder sb = new StringBuilder();\nfor (int x : result) sb.append(x).append('\\n');\nSystem.out.print(sb);",
          codeLang: "java",
          use: [
            "값 범위가 작으면 `HashMap<Integer, Integer>` 대신 `int[]`로 빈도를 센다.",
            "정렬 대상이 `int[]`이고 최악 입력이 의심되면 셔플 후 정렬하거나 `long[]`/`Integer[]`로 바꿔 정렬한다.",
            "출력이 수십만 줄이면 `StringBuilder`로 모아 한 번에 출력한다."
          ],
          warn: [
            "`Arrays.sort(int[])`는 듀얼 피벗 퀵 정렬이라 최악 O(N²)을 노린 입력이 있을 수 있다. 의심되면 `Integer[]`나 섞기(shuffle) 후 정렬한다.",
            "`List<Integer>`에서 `list.remove(x)`는 인덱스 삭제로 해석된다. 값 삭제는 `remove(Integer.valueOf(x))`."
          ],
          myth: [
            [
              "자바라서 시간 초과가 났다.",
              "대부분은 Scanner·println 반복, 박싱 컬렉션, 숨은 O(N) 호출 때문이다. 입출력과 자료구조를 바꾸면 같은 알고리즘으로 통과하는 경우가 많다."
            ]
          ],
          answer: "자바에서는 같은 복잡도라도 원시 배열이 박싱 컬렉션보다, 배열 인덱싱이 HashMap보다 훨씬 빠릅니다. 입력은 BufferedReader, 출력은 StringBuilder로 모아 한 번에 내고, 반복문 안 문자열 더하기를 피하는 것만으로도 시간 초과가 사라지는 경우가 많습니다.",
          followUps: [
            [
              "`Arrays.sort(int[])`와 `Collections.sort`는 무엇이 다른가요?",
              "원시 배열은 듀얼 피벗 퀵 정렬로 빠르지만 안정 정렬이 아니고 최악 O(N²) 입력이 있을 수 있습니다. 객체 정렬(`Collections.sort`, `Arrays.sort(Object[])`)은 TimSort라 안정 정렬이고 최악 O(N log N)이지만 객체 비교 비용이 있습니다."
            ]
          ],
          related: [
            "algo/ipryeok-keugiro-algorijeum-goreugi",
            "algo/ppareun-ipchulryeok",
            "algo/jabaui-jeongryeol-timsort",
            "algo/sigan-chogwa-dibeoging"
          ]
        }
      ]
    },
    {
      name: "재귀",
      compare: {
        cols: ["기준", "재귀와 호출 스택", "분할 정복", "꼬리 재귀와 반복 변환"],
        rows: [
          ["핵심", "기저 사례 + 작아지는 호출", "분할 → 정복 → 결합", "마지막 연산이 재귀 호출"],
          ["공간", "O(재귀 깊이)", "보통 O(log N) 깊이", "반복으로 바꾸면 O(1) 또는 명시적 스택"],
          ["자바 주의점", "깊이 10^4 이상 StackOverflowError", "중간값 오버플로", "JVM은 꼬리 호출 최적화 없음"]
        ]
      },
      concepts: [
        {
          id: "algo/jaegwiwa-hochul-seutaek",
          slug: "jaegwiwa-hochul-seutaek",
          title: "재귀와 호출 스택",
          deep: false,
          def: "함수가 자기 자신을 더 작은 입력으로 호출해 문제를 푸는 방식으로, 호출마다 매개변수와 지역 변수가 담긴 스택 프레임이 쌓인다.",
          how: [
            "재귀 함수는 세 가지로 이루어진다.",
            "- 기저 사례: 더 쪼개지 않고 바로 답을 내는 조건. 없으면 무한 재귀.",
            "- 작아지는 호출: 매 호출마다 문제가 기저 사례 쪽으로 줄어들어야 한다.",
            "- 결합: 하위 호출의 결과로 현재 답을 만든다.",
            "호출할 때 스택 프레임이 쌓이고, 반환하면 하나씩 빠진다. 재귀 깊이가 곧 추가 공간 O(깊이)다.",
            "자바 기본 스레드 스택(보통 512KB~1MB)에서는 깊이 수천~수만에서 `StackOverflowError`가 난다. N=10^5짜리 일자형 트리 DFS가 대표적인 함정이다.",
            "해결: 반복문 + 명시적 스택으로 바꾸거나, 큰 스택을 준 스레드에서 실행한다."
          ],
          code: "// 깊은 재귀가 필요하면 스택 크기를 키운 스레드에서 실행\npublic static void main(String[] args) throws Exception {\n    Thread t = new Thread(null, () -> {\n        try { solve(); } catch (Exception e) { throw new RuntimeException(e); }\n    }, \"main\", 1 << 27); // 128MB 스택\n    t.start();\n    t.join();\n}\n\nstatic int depth(Node node) {           // 기저 사례 + 작아지는 호출 + 결합\n    if (node == null) return 0;\n    return 1 + Math.max(depth(node.left), depth(node.right));\n}",
          codeLang: "java",
          use: [
            "트리·그래프 DFS가 N=10^5에서 런타임 에러가 나면 일자형 입력에서 재귀 깊이가 원인인지 먼저 의심한다.",
            "백트래킹은 깊이가 작아서(N ≤ 15 정도) 재귀로 짜는 것이 가장 읽기 쉽다."
          ],
          warn: ["같은 하위 문제를 반복 호출하면 지수 시간이 된다. 겹치는 하위 문제가 보이면 메모이제이션을 붙인다."],
          myth: [["재귀는 항상 반복문보다 느리다.", "호출 오버헤드는 있지만 복잡도는 같다. 문제는 속도보다 깊이에 따른 스택 오버플로와 겹치는 하위 문제의 반복 계산이다."]],
          answer: "재귀는 기저 사례, 기저 사례 쪽으로 작아지는 호출, 하위 결과의 결합으로 이루어지고, 호출마다 스택 프레임이 쌓여 깊이만큼 공간을 씁니다. 자바는 기본 스택이 작아 깊이가 수만이면 StackOverflowError가 나므로 반복문과 명시적 스택으로 바꾸거나 큰 스택을 준 스레드에서 실행합니다.",
          analogy: "책상 위에 서류를 쌓아 두고 맨 위 서류부터 처리하는 것과 같습니다. 일을 맡길 때마다 서류가 한 장씩 쌓이고, 끝나면 한 장씩 치웁니다. 너무 높이 쌓이면 무너집니다.",
          followUps: [
            [
              "재귀 함수를 설계할 때 무엇부터 정하나요?",
              "함수가 무엇을 반환하는지 한 문장으로 정의하고, 기저 사례를 정한 뒤, 하위 호출의 결과를 믿고 현재 답을 어떻게 만들지 정합니다. 하위 호출 내부를 따라가며 생각하지 않는 것이 요령입니다."
            ]
          ],
          related: [
            "algo/kkori-jaegwiwa-banbok-byeonhwan",
            "algo/bunhal-jeongbok",
            "algo/dfs",
            "algo/memoijeisyeon",
            "algo/baekteuraeking"
          ]
        },
        {
          id: "algo/bunhal-jeongbok",
          slug: "bunhal-jeongbok",
          title: "분할 정복",
          deep: true,
          def: "문제를 같은 형태의 작은 부분 문제로 나누고(분할), 각각 재귀로 풀고(정복), 그 결과를 합쳐(결합) 원래 문제의 답을 만드는 설계 기법이다.",
          why: "큰 문제를 직접 풀면 O(N²)인 것도, 반으로 나눠 풀고 합치는 비용이 작으면 O(N log N)으로 줄어든다. 정렬, 거듭제곱, 최근접 점 쌍 같은 문제의 표준 해법이다.",
          how: [
            "1) 분할: 입력을 보통 절반 두 개로 나눈다.",
            "2) 정복: 각 절반을 재귀로 푼다. 충분히 작으면 직접 푼다.",
            "3) 결합: 두 결과를 합친다. 이 비용이 전체 복잡도를 결정한다.",
            "- 병합 정렬: `T(N) = 2T(N/2) + O(N)` → O(N log N).",
            "- 이분 탐색: 한쪽만 보므로 `T(N) = T(N/2) + O(1)` → O(log N).",
            "- 빠른 거듭제곱: `a^n = (a^(n/2))²` → O(log n). 큰 수 모듈러 거듭제곱, 행렬 거듭제곱(피보나치 O(log N))에 쓴다.",
            "- 퀵 정렬: 피벗으로 나누는 쪽에 비용이 있고 결합은 공짜다.",
            "DP와의 차이: 분할 정복의 부분 문제는 서로 겹치지 않는다. 겹치면(피보나치) 같은 계산이 반복되므로 DP로 바꾼다."
          ],
          flow: ["문제를 절반으로 분할", "각 절반을 재귀로 정복", "충분히 작으면 직접 해결", "두 결과를 결합", "결합 비용으로 복잡도 결정"],
          code: "// 빠른 거듭제곱: a^n mod m, O(log n)\nstatic long pow(long a, long n, long m) {\n    if (n == 0) return 1 % m;\n    long half = pow(a, n / 2, m);\n    long res = half * half % m;\n    return (n % 2 == 1) ? res * (a % m) % m : res;\n}\n\n// 병합 정렬로 역순 쌍(inversion) 개수 세기 O(N log N)\nstatic long sortCount(int[] a, int[] tmp, int lo, int hi) {\n    if (hi - lo <= 1) return 0;\n    int mid = (lo + hi) >>> 1;\n    long cnt = sortCount(a, tmp, lo, mid) + sortCount(a, tmp, mid, hi);\n    int i = lo, j = mid, k = lo;\n    while (i < mid && j < hi) {\n        if (a[i] <= a[j]) tmp[k++] = a[i++];\n        else { cnt += mid - i; tmp[k++] = a[j++]; }\n    }\n    while (i < mid) tmp[k++] = a[i++];\n    while (j < hi) tmp[k++] = a[j++];\n    System.arraycopy(tmp, lo, a, lo, hi - lo);\n    return cnt;\n}",
          codeLang: "java",
          use: [
            "큰 수 거듭제곱의 나머지(a^b mod m, b ≤ 10^18)를 빠른 거듭제곱으로 O(log b)에 구한다.",
            "역순 쌍 개수, 버블 정렬 교환 횟수 문제를 병합 정렬로 O(N log N)에 센다.",
            "피보나치 N번째 항(N ≤ 10^18)을 행렬 거듭제곱으로 푼다."
          ],
          warn: [
            "`(lo + hi) / 2`는 큰 인덱스에서 오버플로가 난다. `lo + (hi - lo) / 2`나 `(lo + hi) >>> 1`을 쓴다.",
            "부분 문제가 겹치는데 분할 정복으로 풀면 지수 시간이 된다."
          ],
          myth: [
            [
              "분할 정복은 항상 반으로 나눠야 한다.",
              "퀵 정렬처럼 피벗에 따라 크기가 다르게 나뉘기도 하고, 세 갈래 이상으로 나누기도 한다. 핵심은 같은 형태의 독립적인 부분 문제로 나누는 것이다."
            ]
          ],
          answer: "분할 정복은 문제를 같은 형태의 작은 부분 문제로 나누고, 각각 재귀로 푼 뒤, 결과를 합쳐 답을 만드는 기법입니다. 병합 정렬은 T(N) = 2T(N/2) + O(N)이라 O(N log N)이고, 빠른 거듭제곱은 절반만 계산해 O(log N)입니다. 부분 문제가 겹치면 DP로 바꿉니다.",
          analogy: "전교생 시험지를 채점할 때 반별로 나눠 각 반 선생님이 채점하고 결과를 모으는 것과 같습니다. 반끼리 채점이 겹치지 않아야 효율적입니다.",
          qa: [
            "분할 정복과 동적 계획법은 어떻게 다른가요?",
            "둘 다 큰 문제를 작은 부분 문제로 나눠 풉니다. 분할 정복은 부분 문제가 서로 독립적이라 각각 한 번씩만 풀고 합치면 되고, 병합 정렬과 퀵 정렬이 대표적입니다. 동적 계획법은 같은 부분 문제가 여러 번 나오기 때문에 결과를 저장해 재사용하는 것이 핵심입니다. 그래서 부분 문제가 겹치는지가 둘을 가르는 기준입니다."
          ],
          followUps: [
            [
              "병합 정렬과 퀵 정렬은 분할 정복에서 어디에 비용을 쓰나요?",
              "병합 정렬은 나누기는 공짜이고 합치기(병합)에 O(N)을 씁니다. 퀵 정렬은 피벗 기준으로 나누는 데 O(N)을 쓰고 합치기는 공짜입니다. 그래서 퀵 정렬은 피벗이 한쪽으로 치우치면 최악 O(N²)이 됩니다."
            ],
            [
              "빠른 거듭제곱을 반복문으로 바꿀 수 있나요?",
              "지수를 이진수로 보고 비트가 1인 자리에서만 결과에 곱하며 밑을 제곱해 나가면 됩니다. 재귀 없이 O(log n)이고 스택도 쓰지 않습니다."
            ]
          ],
          related: [
            "algo/byeonghap-jeongryeol",
            "algo/kwik-jeongryeol",
            "algo/ibun-tamsaek",
            "algo/dongjeok-gyehoekbeop",
            "algo/jaegwiwa-hochul-seutaek",
            "algo/sigan-bokjapdo-gyesan"
          ]
        },
        {
          id: "algo/kkori-jaegwiwa-banbok-byeonhwan",
          slug: "kkori-jaegwiwa-banbok-byeonhwan",
          title: "꼬리 재귀와 반복 변환",
          deep: false,
          def: "꼬리 재귀는 재귀 호출이 함수의 마지막 연산이라 호출 뒤에 할 일이 없는 재귀이고, 이런 재귀는 반복문으로 기계적으로 바꿀 수 있다.",
          how: [
            "`return n * fact(n - 1)`은 호출이 끝난 뒤 곱셈이 남아 꼬리 재귀가 아니다. 누적값을 매개변수로 넘기면 `return fact(n - 1, acc * n)`처럼 꼬리 재귀가 된다.",
            "일부 언어(Scala, Kotlin `tailrec`, 함수형 언어)는 꼬리 호출을 점프로 바꿔(TCO) 스택을 쓰지 않는다. 자바 컴파일러와 JVM은 꼬리 호출 최적화를 하지 않는다. 그래서 자바에서는 직접 반복문으로 바꿔야 한다.",
            "- 꼬리 재귀 → while: 매개변수를 지역 변수로 두고 갱신하며 반복한다.",
            "- 일반 재귀(DFS) → 명시적 스택: `Deque`에 처리할 상태를 넣고 꺼내며 처리한다. 후위 처리(자식 결과가 필요)가 있으면 방문 상태 플래그나 두 번 넣기로 처리한다."
          ],
          code: "// 재귀 DFS → 명시적 스택 (깊이 10^5 이상에서도 StackOverflow 없음)\nboolean[] visited = new boolean[n];\nDeque<Integer> stack = new ArrayDeque<>();\nstack.push(start);\nwhile (!stack.isEmpty()) {\n    int u = stack.pop();\n    if (visited[u]) continue;\n    visited[u] = true;\n    for (int v : graph.get(u)) if (!visited[v]) stack.push(v);\n}\n\n// 꼬리 재귀 gcd → 반복\nstatic long gcd(long a, long b) {\n    while (b != 0) { long t = a % b; a = b; b = t; }\n    return a;\n}",
          codeLang: "java",
          use: [
            "N=10^6 노드의 그래프 탐색을 재귀 DFS 대신 ArrayDeque 스택이나 BFS로 바꿔 StackOverflowError를 피한다.",
            "유클리드 호제법, 이분 탐색처럼 꼬리 재귀 꼴인 함수는 처음부터 while문으로 쓴다."
          ],
          warn: ["명시적 스택 DFS는 이웃을 넣는 순서 때문에 재귀 DFS와 방문 순서가 다를 수 있다. 순서가 중요하면 이웃을 역순으로 push한다."],
          myth: [["자바도 꼬리 재귀로 쓰면 스택을 안 쓴다.", "javac와 HotSpot JVM은 꼬리 호출 최적화를 하지 않는다. 꼬리 재귀로 써도 깊이만큼 스택 프레임이 쌓인다."]],
          answer: "꼬리 재귀는 재귀 호출이 함수의 마지막 연산이라 호출 뒤에 할 일이 없는 재귀입니다. 다른 언어는 이를 반복으로 최적화하지만 자바는 꼬리 호출 최적화를 하지 않으므로, 깊은 재귀는 직접 while문이나 Deque를 쓴 명시적 스택으로 바꿔야 합니다.",
          followUps: [
            [
              "후위 순회처럼 자식 결과가 필요한 재귀는 어떻게 반복으로 바꾸나요?",
              "노드를 스택에 처음 넣을 때와 자식 처리가 끝난 뒤 다시 꺼낼 때를 구분하는 플래그를 같이 넣습니다. 처음 꺼내면 자신을 \"처리 완료 대기\" 상태로 다시 넣고 자식들을 넣으며, 두 번째로 꺼낼 때 자식 결과로 자신의 값을 계산합니다."
            ]
          ],
          related: ["algo/jaegwiwa-hochul-seutaek", "algo/dfs", "algo/gonggan-bokjapdo"]
        }
      ]
    }
  ]
};

export default topic;
