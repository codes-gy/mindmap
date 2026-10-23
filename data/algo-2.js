(window.MINDMAP = window.MINDMAP || {})['algo-2'] = {
  name: '배열 · 문자열 기법',
  groups: [
    { name: '구간 계산', items: [
      { t: '누적합', deep: true,
        d: '배열의 앞에서부터 합을 미리 쌓아 두고, 구간 합을 두 누적값의 차이로 O(1)에 구하는 기법이다.',
        why: '구간 합 질의가 Q번 들어올 때마다 구간을 직접 더하면 O(N×Q)다. N과 Q가 10만이면 100억 번 연산이라 시간 초과가 난다. 전처리 O(N) 한 번으로 질의를 O(1)로 바꾸기 위해서다.',
        how: [
          '`prefix[i]`를 "앞에서부터 i개 원소의 합"으로 정의하고 `prefix[0] = 0`으로 둔다.',
          '1) 전처리: `prefix[i] = prefix[i-1] + arr[i-1]`을 i = 1..N까지 계산한다. O(N).',
          '2) 질의: 구간 [l, r](0-indexed, 양 끝 포함)의 합은 `prefix[r+1] - prefix[l]`이다. O(1).',
          '인덱스를 1칸 밀어 `prefix[0] = 0`을 두는 이유는 l = 0일 때 별도 분기 없이 같은 식을 쓰기 위해서다.',
          '- 합뿐 아니라 XOR, 개수(조건을 만족하는 원소 수)처럼 역연산이 있는 연산에 모두 쓸 수 있다.',
          '- 최댓값·최솟값은 역연산이 없어 누적합으로 구간 질의를 할 수 없다. 세그먼트 트리나 희소 테이블을 쓴다.',
          '- 값이 중간에 바뀌는 문제(업데이트 + 구간 합)는 누적합을 매번 다시 만들어야 하므로 펜윅 트리나 세그먼트 트리로 넘어간다.',
          '응용: "합이 K인 부분 배열의 개수"는 `prefix[j] - prefix[i] = K`이므로 지금까지 나온 prefix 값의 빈도를 해시맵에 세면서 `prefix[j] - K`의 개수를 더해 O(N)에 푼다.'
        ],
        code: `int n = arr.length;
long[] prefix = new long[n + 1];          // 합이 커질 수 있으면 long
for (int i = 1; i <= n; i++) {
    prefix[i] = prefix[i - 1] + arr[i - 1];
}

// 구간 [l, r] 합 (0-indexed, 양 끝 포함)
long rangeSum(int l, int r) {
    return prefix[r + 1] - prefix[l];
}

// 합이 K인 부분 배열 개수: O(N)
Map<Long, Integer> count = new HashMap<>();
count.put(0L, 1);
long sum = 0, answer = 0;
for (int x : arr) {
    sum += x;
    answer += count.getOrDefault(sum - K, 0);
    count.merge(sum, 1, Integer::sum);
}`,
        warn: [
          '원소가 10^9이고 N이 10^5면 합이 10^14까지 커진다. `prefix`는 `long`으로 선언한다.',
          '구간 경계가 포함인지 미포함인지, 0-indexed인지 1-indexed인지 문제마다 다르다. 처음에 한 가지 규칙으로 정하고 끝까지 지킨다.'
        ],
        qa: ['구간 합 질의가 많을 때 어떻게 최적화하나요?',
          '누적합 배열을 O(N)에 한 번 만들어 두고, 구간 [l, r]의 합을 prefix[r+1] - prefix[l]로 O(1)에 답합니다. 질의가 Q개면 O(N + Q)가 됩니다. 다만 중간에 값이 바뀌는 문제라면 업데이트마다 O(N)이 들기 때문에 펜윅 트리나 세그먼트 트리로 업데이트와 질의를 모두 O(log N)에 처리합니다.'],
        rel: ['2차원 누적합', '차분 배열', '해시로 빈도 세기', '펜윅 트리', '정수 오버플로'] },
      { t: '2차원 누적합', deep: false,
        d: '격자의 (0,0)부터 (i,j)까지 직사각형의 합을 미리 구해 두고, 임의 직사각형 영역의 합을 포함-배제로 O(1)에 구하는 기법이다.',
        how: [
          '`S[i][j]`를 위쪽 i행, 왼쪽 j열로 이루어진 직사각형의 합으로 정의한다. 0행과 0열은 모두 0이다.',
          '1) 전처리: `S[i][j] = A[i-1][j-1] + S[i-1][j] + S[i][j-1] - S[i-1][j-1]`. 위와 왼쪽을 더하면 겹치는 왼쪽 위 영역이 두 번 더해지므로 한 번 뺀다. O(N×M).',
          '2) 질의: (r1,c1)~(r2,c2) 영역 합은 `S[r2+1][c2+1] - S[r1][c2+1] - S[r2+1][c1] + S[r1][c1]`. 두 번 빠진 왼쪽 위를 다시 더한다. O(1).',
          '- 대표 문제: 격자에서 K×K 영역의 최대 합, 직사각형 질의 다수, 2차원 범위 안의 1의 개수.'
        ],
        code: `long[][] S = new long[n + 1][m + 1];
for (int i = 1; i <= n; i++)
    for (int j = 1; j <= m; j++)
        S[i][j] = A[i - 1][j - 1] + S[i - 1][j] + S[i][j - 1] - S[i - 1][j - 1];

// (r1, c1) ~ (r2, c2) 합, 0-indexed 양 끝 포함
long query(int r1, int c1, int r2, int c2) {
    return S[r2 + 1][c2 + 1] - S[r1][c2 + 1] - S[r2 + 1][c1] + S[r1][c1];
}`,
        warn: ['포함-배제 부호를 하나만 틀려도 답이 조용히 틀린다. 2×2 정도의 작은 격자로 손 계산과 맞춰 본다.'],
        rel: ['누적합', '차분 배열'] },
      { t: '차분 배열', deep: false,
        d: '구간 [l, r]에 값 v를 더하는 업데이트를 양 끝 두 칸만 기록해 O(1)에 처리하고, 마지막에 누적합으로 실제 배열을 복원하는 기법이다.',
        how: [
          '누적합의 반대 방향이다. 질의가 많으면 누적합, 구간 업데이트가 많으면 차분 배열을 쓴다.',
          '1) `diff[l] += v`, `diff[r+1] -= v`. l부터 v가 더해지고 r+1부터 다시 빠진다는 표시다. O(1).',
          '2) 모든 업데이트가 끝난 뒤 `diff`의 누적합을 구하면 각 위치에 더해진 최종 값이 된다. O(N).',
          '- 업데이트가 모두 끝난 뒤 결과를 한 번만 볼 때(오프라인) 쓴다. 업데이트와 질의가 섞여 있으면 펜윅 트리(구간 업데이트 버전)나 지연 전파 세그먼트 트리가 필요하다.',
          '- 2차원도 같은 원리로 네 모서리에 +v, -v, -v, +v를 기록하고 2차원 누적합으로 복원한다.',
          '- 대표 문제: 회의실 시간대별 사용 인원, 버스 구간 승객 수, "가장 많이 겹치는 시점".'
        ],
        code: `long[] diff = new long[n + 1];
for (int[] q : updates) {          // q = {l, r, v}
    diff[q[0]] += q[2];
    diff[q[1] + 1] -= q[2];
}
long[] result = new long[n];
long run = 0;
for (int i = 0; i < n; i++) {
    run += diff[i];
    result[i] = run;
}`,
        warn: ['`r + 1`이 배열 끝을 넘을 수 있으므로 배열을 n + 1 크기로 잡는다.'],
        rel: ['누적합', '2차원 누적합', '세그먼트 트리'] }
    ]},
    { name: '탐색 보조', items: [
      { t: 'lower bound · upper bound', deep: true,
        d: '정렬된 배열에서 lower bound는 x 이상인 첫 위치, upper bound는 x 초과인 첫 위치를 이분 탐색으로 O(log N)에 찾는다.',
        why: '일반 이분 탐색은 값이 있는지만 알려 주고, 중복 값이 있으면 어느 위치를 돌려줄지 정해져 있지 않다. "x 이상인 원소가 몇 개인가", "x가 몇 번 나오는가"처럼 경계 위치가 필요한 문제가 훨씬 많다.',
        how: [
          '탐색 범위를 반열린 구간 [lo, hi)로 두고, 조건을 만족하는 첫 위치를 찾는 형태로 통일한다.',
          '1) lo = 0, hi = n. 답은 항상 [lo, hi] 안에 있다(n이면 "없음").',
          '2) mid = (lo + hi) >>> 1. lower bound는 `arr[mid] >= x`, upper bound는 `arr[mid] > x`가 참이면 hi = mid, 거짓이면 lo = mid + 1.',
          '3) lo == hi가 되면 그 위치가 답이다.',
          '- x의 개수 = upper(x) - lower(x)',
          '- x 이상인 원소 수 = n - lower(x), x 미만인 원소 수 = lower(x)',
          '- 범위 [a, b]에 속한 원소 수 = upper(b) - lower(a)',
          '자바의 `Arrays.binarySearch`는 중복이 있으면 아무 위치나 돌려주고, 없으면 `-(삽입위치) - 1`을 돌려준다. 경계가 필요하면 직접 구현하거나 `TreeMap`의 `ceilingKey`/`higherKey`를 쓴다.'
        ],
        code: `// x 이상인 첫 위치 (없으면 n)
static int lowerBound(int[] arr, int x) {
    int lo = 0, hi = arr.length;
    while (lo < hi) {
        int mid = (lo + hi) >>> 1;
        if (arr[mid] >= x) hi = mid;
        else lo = mid + 1;
    }
    return lo;
}

// x 초과인 첫 위치 (없으면 n)
static int upperBound(int[] arr, int x) {
    int lo = 0, hi = arr.length;
    while (lo < hi) {
        int mid = (lo + hi) >>> 1;
        if (arr[mid] > x) hi = mid;
        else lo = mid + 1;
    }
    return lo;
}

int countX = upperBound(arr, x) - lowerBound(arr, x);`,
        warn: [
          '`(lo + hi) / 2`는 lo, hi가 클 때 int 오버플로가 난다. `>>> 1`이나 `lo + (hi - lo) / 2`를 쓴다.',
          '`hi = mid - 1`, `while (lo <= hi)` 같은 다른 스타일과 섞어 쓰면 무한 루프나 한 칸 오차가 생긴다. 한 가지 템플릿을 정해 외운다.',
          '배열이 정렬되어 있지 않으면 결과가 의미 없다.'
        ],
        qa: ['정렬된 배열에서 특정 값의 개수를 O(log N)에 구하려면 어떻게 하나요?',
          'lower bound로 x 이상인 첫 위치를, upper bound로 x 초과인 첫 위치를 각각 이분 탐색으로 구한 뒤 그 차이를 답으로 합니다. 두 탐색 모두 [lo, hi) 반열린 구간에서 조건을 만족하는 첫 위치를 찾는 같은 틀이고, 비교 조건만 >=와 >로 다릅니다.'],
        rel: ['이분 탐색', '파라메트릭 서치', '좌표 압축', 'LIS', 'TreeMap · TreeSet 활용'] },
      { t: '좌표 압축', deep: false,
        d: '값의 범위는 크지만 서로 다른 값의 개수는 적을 때, 값을 크기 순서(0, 1, 2, ...)로 바꿔 작은 배열 인덱스로 다루는 기법이다.',
        why: '값이 -10^9 ~ 10^9라면 값을 인덱스로 쓰는 배열(카운팅, 펜윅 트리, 세그먼트 트리)을 만들 수 없다. 하지만 원소가 10^5개라면 서로 다른 값도 최대 10^5개이므로 순위로 바꾸면 배열 크기를 10^5로 줄일 수 있다.',
        how: [
          '1) 값을 복사해 정렬하고 중복을 제거한다. O(N log N).',
          '2) 각 원소의 압축 값 = 정렬된 고유 배열에서의 lower bound 위치. O(log N)씩.',
          '- 대소 관계만 보존되고 값 사이의 간격 정보는 사라진다. 거리나 길이를 계산해야 하면 원래 값 배열을 따로 보관해 역으로 찾는다.',
          '- 대표 문제: 값 범위가 큰 역순쌍 개수(펜윅 트리), 구간 겹침을 차분 배열로 처리, "자기보다 작은 서로 다른 값의 개수".'
        ],
        code: `int[] sorted = Arrays.stream(arr).distinct().sorted().toArray();
int[] comp = new int[n];
for (int i = 0; i < n; i++) {
    comp[i] = Arrays.binarySearch(sorted, arr[i]); // 고유 값이라 정확한 위치가 나온다
}
// 원래 값이 필요하면 sorted[comp[i]]`,
        warn: ['구간 문제에서 좌표를 압축하면 구간 사이의 빈 공간이 사라진다. 길이를 구해야 하면 압축된 칸 사이의 실제 거리 `sorted[k+1] - sorted[k]`를 곱해 준다.'],
        rel: ['lower bound · upper bound', '펜윅 트리', '세그먼트 트리', '차분 배열'] },
      { t: '해시로 빈도 세기', deep: false,
        d: '`HashMap`이나 고정 크기 배열에 원소별 등장 횟수를 기록해, 중복·쌍·애너그램 같은 문제를 O(N)에 푸는 기법이다.',
        how: [
          '이중 반복문으로 "두 원소를 비교"하는 O(N²) 풀이를, 지나온 원소를 해시에 기억해 두고 한 번 지나가며 찾는 O(N) 풀이로 바꾼다.',
          '- Two Sum: 각 x에 대해 `target - x`가 이미 나왔는지 해시에서 O(1)에 확인한다.',
          '- 애너그램 판별: 두 문자열의 알파벳 빈도 배열(`int[26]`)이 같은지 비교한다.',
          '- 가장 많이 나온 원소, 처음으로 한 번만 나온 문자, 부분 배열 합이 K인 개수(누적합 + 해시).',
          '키가 소문자 알파벳이나 작은 정수면 `HashMap`보다 배열이 훨씬 빠르다. 박싱과 해시 계산이 없기 때문이다.'
        ],
        code: `// Two Sum: 인덱스 쌍 찾기, O(N)
Map<Integer, Integer> seen = new HashMap<>();
for (int i = 0; i < nums.length; i++) {
    Integer j = seen.get(target - nums[i]);
    if (j != null) return new int[]{j, i};
    seen.put(nums[i], i);
}

// 빈도 세기
Map<String, Integer> freq = new HashMap<>();
for (String w : words) freq.merge(w, 1, Integer::sum);

// 알파벳이면 배열이 더 빠르다
int[] cnt = new int[26];
for (char c : s.toCharArray()) cnt[c - 'a']++;`,
        warn: [
          '`Integer` 키를 `==`로 비교하면 -128~127 밖의 값에서 false가 나온다. `equals`나 언박싱한 값으로 비교한다.',
          '해시 연산은 평균 O(1)이지만 상수가 크다. N이 10^6 이상이고 키가 작은 정수면 배열을 쓴다.'
        ],
        rel: ['누적합', '슬라이딩 윈도우', '투 포인터', '문제 유형 판별 신호'] }
    ]},
    { name: '스택 활용', items: [
      { t: '모노토닉 스택', deep: true,
        d: '스택 안의 값이 항상 증가(또는 감소) 순서를 유지하도록 push 전에 조건을 깨는 원소를 pop하며, 각 원소의 "다음 큰 값"이나 "이전 작은 값"을 O(N)에 구하는 기법이다.',
        why: '각 원소마다 오른쪽으로 훑어 처음 나오는 더 큰 값을 찾으면 O(N²)이다. 이미 답을 찾은 원소는 다시 볼 필요가 없다는 점을 이용하면, 모든 원소가 스택에 한 번 들어가고 한 번 나오므로 전체 O(N)이 된다.',
        how: [
          '"다음 큰 원소(Next Greater Element)" 기준:',
          '1) 왼쪽부터 순회하며 스택에는 아직 답(자기보다 큰 오른쪽 값)을 못 찾은 원소의 인덱스를 둔다. 스택의 값은 위로 갈수록 작아진다(단조 감소).',
          '2) 현재 값이 스택 top의 값보다 크면, top의 답은 현재 값이다. pop하고 답을 기록한 뒤 조건이 깨질 때까지 반복한다.',
          '3) 현재 인덱스를 push한다.',
          '4) 순회가 끝나도 스택에 남은 원소는 답이 없다(-1).',
          '- 다음 작은 값을 찾으려면 비교 방향만 바꿔 단조 증가 스택을 쓴다.',
          '- 이전 큰/작은 값은 오른쪽에서 왼쪽으로 순회하거나, pop이 끝난 뒤의 top을 답으로 쓴다.',
          '- 대표 문제: 오큰수, 일일 온도(며칠 뒤 더 따뜻해지나), 히스토그램에서 가장 큰 직사각형, 빗물 담기, 주식 가격 유지 기간.',
          '히스토그램 문제에서는 막대를 pop할 때, 그 막대 높이로 만들 수 있는 직사각형의 폭이 "현재 인덱스 - pop 후 top - 1"로 정해진다.'
        ],
        code: `// 오큰수: 각 원소의 오른쪽에서 처음 나오는 더 큰 값, 없으면 -1
int[] answer = new int[n];
Arrays.fill(answer, -1);
Deque<Integer> stack = new ArrayDeque<>();   // 인덱스 저장, 값은 단조 감소
for (int i = 0; i < n; i++) {
    while (!stack.isEmpty() && arr[stack.peek()] < arr[i]) {
        answer[stack.pop()] = arr[i];
    }
    stack.push(i);
}`,
        warn: [
          '값이 아니라 인덱스를 넣어야 거리(며칠 뒤)나 폭을 계산할 수 있다.',
          '같은 값을 어떻게 처리할지(`<` 대 `<=`)에 따라 답이 달라진다. "크거나 같은"인지 "큰"인지 문제를 다시 확인한다.',
          '자바의 `Stack` 클래스는 동기화 비용이 있어 느리다. `ArrayDeque`를 쓴다.'
        ],
        qa: ['각 원소의 오른쪽에 있는 첫 번째 더 큰 값을 O(N)에 구하는 방법은?',
          '단조 감소 스택을 씁니다. 왼쪽부터 순회하면서 현재 값이 스택 top의 값보다 크면 top의 답이 현재 값이므로 pop하며 기록하고, 조건이 깨지면 현재 인덱스를 push합니다. 모든 원소가 스택에 정확히 한 번 들어가고 한 번 나오기 때문에 이중 반복문처럼 보여도 전체 O(N)입니다.'],
        rel: ['괄호 · 수식 처리', 'ArrayDeque 활용', '투 포인터', '슬라이딩 윈도우'] },
      { t: '괄호 · 수식 처리', deep: false,
        d: '여는 기호를 스택에 쌓고 닫는 기호가 나오면 top과 짝을 맞춰 보는 방식으로, 괄호 검사와 후위 표기식 변환·계산을 O(N)에 처리한다.',
        how: [
          '중첩 구조는 "가장 최근에 열린 것이 가장 먼저 닫힌다"는 LIFO 성질을 가지므로 스택이 자연스럽게 맞는다.',
          '- 괄호 검사: 여는 괄호는 push, 닫는 괄호는 스택이 비었거나 top이 짝이 아니면 실패. 끝났을 때 스택이 비어 있어야 성공이다.',
          '- 후위 표기식 계산: 숫자는 push, 연산자는 두 개를 pop해 계산 후 push. 먼저 pop한 것이 오른쪽 피연산자다.',
          '- 중위 → 후위 변환(Shunting-yard): 연산자 스택에서 현재 연산자보다 우선순위가 높거나 같은 연산자를 pop해 출력한 뒤 push한다. 여는 괄호는 그냥 push, 닫는 괄호는 여는 괄호가 나올 때까지 pop한다.',
          '- 대표 문제: 올바른 괄호, 괄호의 값, 쇠막대기, 문자열 폭발, 후위 표기식.'
        ],
        code: `static boolean valid(String s) {
    Deque<Character> st = new ArrayDeque<>();
    for (char c : s.toCharArray()) {
        if (c == '(' || c == '[' || c == '{') st.push(c);
        else {
            if (st.isEmpty()) return false;
            char open = st.pop();
            if ((c == ')' && open != '(') || (c == ']' && open != '[') || (c == '}' && open != '{'))
                return false;
        }
    }
    return st.isEmpty();
}`,
        warn: ['괄호가 한 종류뿐이면 스택 없이 카운터 하나(열면 +1, 닫으면 -1, 음수가 되면 실패)로 충분하다.'],
        rel: ['모노토닉 스택', 'ArrayDeque 활용'] }
    ]},
    { name: '비트', items: [
      { t: '비트마스킹', deep: false,
        d: '정수의 각 비트를 원소의 포함 여부로 보고, 집합을 int 하나로 표현해 추가·삭제·확인·부분집합 순회를 비트 연산으로 처리하는 기법이다.',
        how: [
          'N개 원소의 부분집합은 0부터 2^N - 1까지의 정수와 일대일로 대응한다. i번째 비트가 1이면 i번째 원소를 포함한다.',
          '- 포함 확인: `(mask & (1 << i)) != 0`',
          '- 추가: `mask | (1 << i)`, 삭제: `mask & ~(1 << i)`, 토글: `mask ^ (1 << i)`',
          '- 원소 개수: `Integer.bitCount(mask)`',
          '- 가장 낮은 1비트: `mask & -mask`, 가장 낮은 1비트 제거: `mask & (mask - 1)`',
          '- 모든 부분집합 순회: `for (mask = 0; mask < (1 << n); mask++)`. O(2^N).',
          '- mask의 부분집합만 순회: `for (sub = mask; sub > 0; sub = (sub - 1) & mask)`. 모든 mask에 대해 하면 O(3^N).',
          'N이 20 이하(2^20 ≈ 100만)면 완전 탐색, N이 16 이하면 외판원 순회 같은 비트마스크 DP를 의심한다.',
          '방문 상태를 배열 대신 int로 두면 해시 키나 DP 인덱스로 바로 쓸 수 있고 복사 비용도 없다.'
        ],
        code: `// N개 원소의 모든 부분집합의 합 중 target과 같은 개수
int count = 0;
for (int mask = 1; mask < (1 << n); mask++) {
    int sum = 0;
    for (int i = 0; i < n; i++) {
        if ((mask & (1 << i)) != 0) sum += arr[i];
    }
    if (sum == target) count++;
}`,
        warn: [
          '`1 << 31`은 음수, `1 << 32`는 다시 1이다. 32개 이상이면 `1L << i`와 long을 쓴다.',
          '`&`는 `==`보다 우선순위가 낮다. `mask & 1 << i == 0`은 의도대로 동작하지 않으므로 반드시 괄호를 친다.'
        ],
        rel: ['비트마스크 DP', '백트래킹', '정수 오버플로', 'Big-O 표기법'] }
    ]},
    { name: '문자열', items: [
      { t: 'KMP', deep: true,
        d: '패턴 안에서 "접두사이면서 접미사인 가장 긴 길이(실패 함수)"를 미리 구해, 불일치가 나도 텍스트를 되돌아가지 않고 O(N + M)에 문자열을 검색하는 알고리즘이다.',
        why: '단순 비교는 텍스트의 각 위치에서 패턴을 처음부터 다시 비교해 최악 O(N×M)이다. "aaaa...ab"에서 "aaab"를 찾는 경우가 대표적이다. 이미 일치한 부분의 정보를 재활용하면 텍스트 포인터를 뒤로 돌리지 않아도 된다.',
        how: [
          '1) 실패 함수 `pi[i]`: 패턴의 0..i 부분 문자열에서 접두사와 접미사가 같은 가장 긴 길이(자기 자신 제외). 예: "ABABC"의 pi = [0, 0, 1, 2, 0].',
          '2) pi 계산: j를 일치 길이로 두고 i = 1부터 진행한다. `p[i] != p[j]`이면 `j = pi[j-1]`로 물러나기를 반복하고, 같으면 j++ 후 `pi[i] = j`. O(M).',
          '3) 검색: 텍스트를 i로 한 번만 지나가며 같은 방식으로 j를 늘리거나 `pi[j-1]`로 물린다. j == M이 되면 일치를 찾은 것이고 `j = pi[j-1]`로 계속 찾는다. O(N).',
          '불일치가 났을 때 "지금까지 일치한 j글자 중 끝부분과 패턴 앞부분이 pi[j-1]글자만큼 같다"는 것을 알고 있으므로, 그만큼은 이미 맞은 것으로 치고 이어서 비교한다.',
          '- 대표 문제: 문자열 찾기(등장 위치 전부), 광고(가장 짧은 반복 단위 = M - pi[M-1]), 문자열 회전 판별(T+T에서 P 찾기).'
        ],
        code: `static int[] failure(char[] p) {
    int[] pi = new int[p.length];
    for (int i = 1, j = 0; i < p.length; i++) {
        while (j > 0 && p[i] != p[j]) j = pi[j - 1];
        if (p[i] == p[j]) pi[i] = ++j;
    }
    return pi;
}

static List<Integer> kmp(char[] t, char[] p) {
    int[] pi = failure(p);
    List<Integer> found = new ArrayList<>();
    for (int i = 0, j = 0; i < t.length; i++) {
        while (j > 0 && t[i] != p[j]) j = pi[j - 1];
        if (t[i] == p[j]) {
            if (j == p.length - 1) {
                found.add(i - p.length + 1);   // 시작 위치
                j = pi[j];
            } else j++;
        }
    }
    return found;
}`,
        warn: [
          '자바 `String.indexOf`는 내부적으로 단순 비교라 최악 O(N×M)이다. 길이가 각각 10^6인 입력에서는 시간 초과가 날 수 있다.',
          '`while`로 여러 번 물러나도 j는 i만큼만 늘 수 있으므로 전체가 선형이다. 이 점을 설명할 수 있어야 한다.'
        ],
        qa: ['KMP가 O(N + M)인 이유는 무엇인가요?',
          '텍스트 포인터 i는 한 번도 뒤로 가지 않고, 불일치가 나면 패턴 포인터 j만 실패 함수 값으로 물러납니다. j는 한 번에 최대 1씩만 늘어나므로 전체 감소량도 늘어난 총량인 N을 넘을 수 없습니다. 그래서 검색이 O(N), 실패 함수 계산이 같은 논리로 O(M)이고 합쳐서 O(N + M)입니다.'],
        rel: ['라빈-카프', '트라이', '시간 복잡도 계산'] },
      { t: '라빈-카프', deep: false,
        d: '문자열을 다항식 해시 값으로 바꾸고, 길이 M인 창을 한 칸씩 밀 때 해시를 O(1)에 갱신(롤링 해시)해 평균 O(N + M)에 문자열을 검색하는 알고리즘이다.',
        how: [
          '해시 `H(s) = s[0]×B^(M-1) + s[1]×B^(M-2) + ... + s[M-1]`을 큰 소수 MOD로 나눈 나머지로 둔다.',
          '1) 패턴 해시와 텍스트 첫 창의 해시를 구한다. O(M).',
          '2) 창을 한 칸 밀 때: 맨 앞 문자의 기여 `t[i]×B^(M-1)`을 빼고, 전체에 B를 곱하고, 새 문자를 더한다. O(1).',
          '3) 해시가 같으면 실제 문자열을 비교해 충돌을 걸러낸다(또는 MOD 두 개를 써서 충돌 확률을 무시할 수준으로 낮춘다).',
          'KMP보다 구현 실수가 적고, 여러 패턴의 길이가 같을 때 해시 집합으로 한 번에 찾거나 "두 번 이상 나오는 가장 긴 부분 문자열"을 이분 탐색 + 해시로 푸는 데 유리하다.'
        ],
        code: `static final long MOD = 1_000_000_007L, B = 31;

static int rabinKarp(String t, String p) {
    int n = t.length(), m = p.length();
    if (m > n) return -1;
    long hp = 0, ht = 0, pow = 1;
    for (int i = 0; i < m; i++) {
        hp = (hp * B + p.charAt(i)) % MOD;
        ht = (ht * B + t.charAt(i)) % MOD;
        if (i > 0) pow = pow * B % MOD;      // B^(m-1)
    }
    for (int i = 0; ; i++) {
        if (hp == ht && t.regionMatches(i, p, 0, m)) return i;
        if (i + m >= n) return -1;
        ht = (ht - t.charAt(i) * pow % MOD + MOD) % MOD;  // 맨 앞 문자 제거
        ht = (ht * B + t.charAt(i + m)) % MOD;            // 새 문자 추가
    }
}`,
        warn: [
          '뺄셈 후 음수가 될 수 있으므로 `+ MOD` 후 다시 나머지를 구한다.',
          '해시가 같다고 바로 일치로 처리하면 충돌로 틀린 답이 나온다. 실제 비교를 하거나 이중 해시를 쓴다.',
          '최악의 경우(해시가 계속 충돌) O(N×M)이 될 수 있다.'
        ],
        rel: ['KMP', '슬라이딩 윈도우', '해시로 빈도 세기', '정수 오버플로'] },
      { t: '트라이', deep: true,
        d: '문자열의 각 문자를 트리의 간선으로 저장해 공통 접두사를 공유하는 트리로, 길이 L인 문자열의 삽입·검색·접두사 검색을 O(L)에 처리한다.',
        why: '단어 N개 중 특정 접두사로 시작하는 단어를 찾을 때 매번 전체를 훑으면 O(N×L)이다. 접두사 자체를 경로로 저장하면 단어 수와 관계없이 접두사 길이만큼만 내려가면 된다.',
        how: [
          '루트는 빈 문자열이고, 각 노드는 다음 문자로 가는 자식 링크와 "여기서 끝나는 단어가 있는가" 표시를 가진다.',
          '1) 삽입: 루트에서 문자 하나씩 자식으로 내려가며, 없으면 새 노드를 만든다. 마지막 노드에 끝 표시를 한다.',
          '2) 검색: 같은 경로로 내려가다 자식이 없으면 실패, 끝까지 가서 끝 표시가 있으면 성공이다.',
          '3) 접두사 검색: 끝 표시를 확인하지 않고 경로가 있는지만 본다.',
          '- 자식 저장: 소문자만 나오면 `Node[26]` 배열이 빠르고, 문자 종류가 많으면 `HashMap<Character, Node>`를 쓴다.',
          '- 노드에 "이 노드를 지나는 단어 수"를 두면 접두사로 시작하는 단어 개수를 O(L)에 답한다.',
          '- 대표 문제: 자동 완성, 전화번호 목록(한 번호가 다른 번호의 접두사인가), 가사 검색, 단어 사전. 비트 단위 트라이는 "XOR 최댓값" 문제에 쓴다.',
          '공간은 최악 O(전체 문자 수 × 알파벳 크기)로 크다. 단어가 많고 길면 메모리 초과를 조심한다.'
        ],
        code: `class Trie {
    static class Node {
        Node[] next = new Node[26];
        boolean end;
        int pass;                       // 이 노드를 지나는 단어 수
    }
    private final Node root = new Node();

    void insert(String w) {
        Node cur = root;
        for (char c : w.toCharArray()) {
            int k = c - 'a';
            if (cur.next[k] == null) cur.next[k] = new Node();
            cur = cur.next[k];
            cur.pass++;
        }
        cur.end = true;
    }

    boolean contains(String w) {
        Node cur = find(w);
        return cur != null && cur.end;
    }

    int countPrefix(String prefix) {
        Node cur = find(prefix);
        return cur == null ? 0 : cur.pass;
    }

    private Node find(String s) {
        Node cur = root;
        for (char c : s.toCharArray()) {
            cur = cur.next[c - 'a'];
            if (cur == null) return null;
        }
        return cur;
    }
}`,
        warn: [
          '단어 수가 많으면 노드 객체 수가 폭증한다. 메모리가 빠듯하면 2차원 int 배열(`int[노드 수][26]`) 기반 트라이로 바꾼다.',
          '단순히 "포함 여부"만 필요하면 `HashSet<String>`이 더 간단하다. 트라이는 접두사 질의가 있을 때 쓴다.'
        ],
        qa: ['트라이는 언제 쓰고, 해시셋과 비교하면 어떤 장단점이 있나요?',
          '트라이는 접두사 검색이나 자동 완성처럼 공통 접두사를 따라가는 질의가 많을 때 씁니다. 길이 L인 문자열의 삽입과 검색이 단어 수와 관계없이 O(L)이고, 접두사로 시작하는 단어 수도 바로 셀 수 있습니다. 반면 해시셋은 완전 일치 검색만 O(L)에 할 수 있고 접두사 질의를 못 합니다. 대신 트라이는 노드마다 자식 배열을 두므로 메모리를 훨씬 많이 씁니다.'],
        rel: ['KMP', '해시로 빈도 세기', 'DFS'] }
    ]}
  ],
  must: [
    '구간 질의가 많으면 누적합, 구간 업데이트가 많으면 차분 배열, 둘이 섞이면 펜윅 트리나 세그먼트 트리다.',
    '이분 탐색은 [lo, hi) 반열린 구간에서 "조건을 만족하는 첫 위치"를 찾는 한 가지 템플릿으로 통일한다.',
    '"다음 큰 값", "히스토그램 넓이"처럼 각 원소가 오른쪽·왼쪽에서 처음 만나는 값을 묻는다면 모노토닉 스택을 떠올린다.',
    '문자열 검색은 단순 비교 O(N×M)이 기본이고, 길이가 10^5 이상이면 KMP나 롤링 해시로 O(N + M)을 만든다.'
  ]
};
