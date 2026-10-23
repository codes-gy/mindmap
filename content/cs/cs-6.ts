import type { Topic } from '../types';

const topic: Topic = {
  key: "cs-6",
  name: "자바 · JVM",
  must: [
    "`==`는 참조 비교, `equals`는 값 비교다. Integer는 -128~127만 캐시되어 그 밖에서는 `==` 비교가 false가 된다.",
    "자바는 항상 값으로 전달한다. 객체는 참조값이 복사되어 전달된다.",
    "static 컬렉션, 해제하지 않은 리스너, 지우지 않은 ThreadLocal이 메모리 누수의 흔한 원인이다.",
    "`Optional`은 반환 타입에 쓰고, 필드나 파라미터에는 쓰지 않는다."
  ],
  groups: [
    {
      name: "JVM 메모리 구조",
      compare: {
        cols: ["기준", "JVM 힙", "JVM 스택", "메서드 영역 · Metaspace"],
        rows: [
          ["저장 대상", "객체, 배열", "스택 프레임, 지역 변수", "클래스 정보, static 변수"],
          ["공유 범위", "모든 스레드 공유", "스레드마다 따로", "모든 스레드 공유"],
          ["정리 방식", "GC가 회수", "메서드 종료 시 제거", "클래스 언로드 시"],
          ["부족할 때", "OOM: Java heap space", "StackOverflowError", "OOM: Metaspace"],
          ["크기 옵션", "-Xms, -Xmx", "-Xss", "-XX:MaxMetaspaceSize"]
        ]
      },
      concepts: [
        {
          id: "cs/jvm-hip",
          slug: "jvm-hip",
          title: "JVM 힙",
          deep: true,
          def: "`new`로 만든 모든 객체와 배열이 저장되는, 모든 스레드가 공유하는 메모리 영역이다.",
          why: "객체는 메서드 호출이 끝나도 계속 쓰일 수 있으므로 호출 단위로 사라지는 스택이 아닌 별도 공간이 필요하다. 힙은 GC가 자동으로 정리해 개발자가 메모리를 직접 해제하지 않아도 된다.",
          how: [
            "자바 소스는 javac로 바이트코드(.class)가 되고, 클래스 로더가 클래스를 올린 뒤 실행 엔진(인터프리터 + JIT)이 실행한다. 실행 중 데이터는 런타임 데이터 영역에 저장되며, 힙은 그중 가장 큰 영역이다.",
            "1) `new Order()`를 실행하면 힙에 객체가 할당되고, 지역 변수에는 그 객체를 가리키는 참조값만 저장된다.",
            "2) 새 객체는 대부분 Young 영역의 Eden에 생기고, GC에서 살아남을수록 Survivor를 거쳐 Old 영역으로 옮겨진다.",
            "3) 더 이상 어떤 참조도 닿지 않는 객체는 GC가 회수한다.",
            "- 크기 설정: `-Xms`(시작 크기), `-Xmx`(최대 크기). 컨테이너 환경에서는 `-XX:MaxRAMPercentage`로 메모리 비율을 지정하기도 한다.",
            "- 공유 영역: 모든 스레드가 같은 힙을 보므로, 여러 스레드가 같은 객체를 바꾸면 동기화가 필요하다.",
            "- 부족하면 `OutOfMemoryError: Java heap space`가 발생한다."
          ],
          flow: ["new로 객체 생성", "Eden 영역에 할당", "지역 변수에 참조 저장", "참조가 끊기면 GC 대상", "GC가 메모리 회수"],
          code: "public void order() {\n    int count = 3;                 // 기본형 지역 변수: 스택에 값 저장\n    Order order = new Order();     // Order 객체: 힙에 저장\n                                   // order 변수(참조값): 스택에 저장\n    order.addItem(\"book\", count);\n}   // 메서드가 끝나면 스택 프레임은 사라지고,\n    // 힙의 Order 객체는 참조가 없어지면 GC 대상이 된다",
          codeLang: "java",
          use: [
            "운영 서버에서 OOM이 나면 -XX:+HeapDumpOnOutOfMemoryError로 힙 덤프를 남겨 원인 객체를 분석한다.",
            "컨테이너 환경에서는 -XX:MaxRAMPercentage로 컨테이너 메모리에 맞춰 힙 크기를 정한다."
          ],
          warn: [
            "static 컬렉션에 객체를 계속 쌓으면 GC 루트에서 계속 닿으므로 회수되지 않아 메모리 누수가 된다.",
            "`-Xmx`를 너무 크게 잡으면 Full GC 한 번의 정지 시간이 길어질 수 있다.",
            "OOM이 나면 `-XX:+HeapDumpOnOutOfMemoryError`로 힙 덤프를 남겨 원인 객체를 분석한다."
          ],
          myth: [["GC가 있으니 자바에는 메모리 누수가 없다", "static 컬렉션이나 캐시처럼 GC 루트에서 계속 닿는 참조가 남으면 회수되지 않아 누수가 생긴다."]],
          answer: "JVM 힙은 new로 만든 객체와 배열이 저장되는 영역으로, 모든 스레드가 공유하고 GC가 관리합니다. 새 객체는 Young 영역에 생기고 오래 살아남으면 Old 영역으로 옮겨집니다. 크기는 -Xms와 -Xmx로 정하며 부족하면 OutOfMemoryError가 발생합니다.",
          analogy: "힙은 모두가 함께 쓰는 큰 창고이고, 청소부(GC)가 주인 없는 물건을 주기적으로 치웁니다.",
          qa: [
            "힙과 스택의 차이를 설명해 주세요.",
            "힙은 new로 만든 객체가 저장되고 모든 스레드가 공유하며 GC가 관리합니다. 스택은 스레드마다 따로 있고 메서드 호출마다 프레임이 쌓였다가 메서드가 끝나면 사라지며, 지역 변수와 객체 참조값이 저장됩니다. 그래서 지역 변수는 스레드 안전하지만 힙의 공유 객체는 동기화가 필요합니다."
          ],
          followUps: [
            [
              "힙이 부족하면 어떻게 대응하나요?",
              "먼저 힙 덤프와 GC 로그로 실제로 메모리를 차지하는 객체가 무엇인지 확인합니다. 누수라면 참조를 정리하고, 정상 사용량이 크다면 -Xmx를 늘리거나 캐시 크기를 제한합니다."
            ],
            [
              "객체는 항상 힙에만 할당되나요?",
              "원칙적으로는 힙이지만, JIT의 탈출 분석으로 메서드 밖으로 나가지 않는 객체는 스칼라 치환되어 힙 할당 자체가 생략될 수 있습니다. 개발자가 이를 제어하지는 않습니다."
            ],
            [
              "힙을 무조건 크게 잡으면 좋은가요?",
              "아닙니다. 힙이 크면 GC 빈도는 줄지만 한 번의 Full GC 정지 시간이 길어질 수 있습니다. 실제 사용량과 GC 로그를 보고 조정합니다."
            ]
          ],
          related: ["cs/jvm-seutaek", "cs/gc-dongjak-wonri", "cs/sedaebyeol-gc"]
        },
        {
          id: "cs/jvm-seutaek",
          slug: "jvm-seutaek",
          title: "JVM 스택",
          deep: true,
          def: "스레드마다 하나씩 만들어져, 메서드 호출 정보(스택 프레임)를 쌓아 두는 메모리 영역이다.",
          why: "메서드 호출과 반환은 항상 나중에 호출된 것이 먼저 끝나는 LIFO 구조라서 스택으로 관리하면 빠르고 단순하다. 스레드마다 따로 있어 지역 변수는 다른 스레드와 섞이지 않는다.",
          how: [
            "1) 메서드가 호출되면 새 스택 프레임이 스택 맨 위에 쌓인다.",
            "2) 프레임에는 지역 변수 배열(매개변수 포함), 연산 중간값을 담는 피연산자 스택, 반환 주소 등이 들어간다.",
            "3) 메서드가 끝나면 프레임이 통째로 제거되어 별도 정리 비용이 없다.",
            "- 기본형 지역 변수(int, long 등)는 값 자체가, 객체 지역 변수는 힙 객체의 참조값이 저장된다.",
            "- 스택 크기는 `-Xss`로 정한다(보통 기본 512KB~1MB).",
            "- 가상 스레드의 스택은 힙에 작은 조각으로 저장되어 필요한 만큼만 커진다. 그래서 수백만 개를 만들 수 있다."
          ],
          flow: ["메서드 호출", "새 스택 프레임 생성", "지역 변수·연산값 저장", "메서드 반환", "프레임 제거"],
          code: "int factorial(int n) {\n    if (n <= 1) return 1;\n    return n * factorial(n - 1); // 호출마다 프레임이 하나씩 쌓인다\n}\n\nfactorial(5);       // 프레임 5개 → 차례로 반환하며 제거\nfactorial(1_000_000); // 프레임이 너무 많아 StackOverflowError",
          codeLang: "java",
          use: [
            "무한 재귀 버그는 StackOverflowError 스택 트레이스에서 반복되는 메서드를 찾아 원인을 확인한다.",
            "가상 스레드는 스택을 힙에 작게 저장해 수백만 개의 동시 작업을 처리한다."
          ],
          warn: [
            "재귀 깊이가 너무 깊으면 `StackOverflowError`가 난다. 반복문이나 명시적 스택으로 바꾼다.",
            "지역 변수는 스레드 안전하지만, 지역 변수가 가리키는 힙 객체를 다른 스레드와 공유하면 안전하지 않다."
          ],
          myth: [["지역 변수에 담은 객체도 스택에 저장된다", "스택에는 참조값만 저장되고 객체 자체는 힙에 있다. 그 객체를 다른 스레드와 공유하면 스레드 안전하지 않다."]],
          answer: "JVM 스택은 스레드마다 하나씩 생기는 영역으로, 메서드를 호출할 때마다 지역 변수와 연산 정보를 담은 스택 프레임이 쌓이고 메서드가 끝나면 제거됩니다. 지역 변수는 스레드마다 따로 있어 스레드 안전합니다. 재귀가 너무 깊으면 StackOverflowError가 납니다.",
          analogy: "책상 위에 서류를 쌓아 두고 맨 위 서류부터 처리하는 것과 같습니다. 일이 끝난 서류는 바로 치웁니다.",
          qa: [
            "StackOverflowError는 언제 발생하나요?",
            "스레드의 스택 공간보다 많은 스택 프레임이 쌓일 때 발생합니다. 주로 종료 조건이 잘못된 재귀나 너무 깊은 재귀 호출이 원인입니다. 재귀를 반복문으로 바꾸거나 꼬리 재귀 형태로 바꾸고, 꼭 필요하면 -Xss로 스택 크기를 늘립니다."
          ],
          followUps: [
            [
              "지역 변수가 스레드 안전한 이유는 무엇인가요?",
              "지역 변수는 각 스레드의 스택 프레임 안에 저장되어 다른 스레드가 접근할 수 없기 때문입니다. 단, 지역 변수가 가리키는 힙 객체를 공유하면 그 객체는 동기화가 필요합니다."
            ],
            [
              "StackOverflowError를 어떻게 해결하나요?",
              "종료 조건이 올바른지 먼저 확인하고, 깊은 재귀는 반복문이나 명시적 스택 자료구조로 바꿉니다. 꼭 필요한 경우에만 -Xss로 스택 크기를 늘립니다."
            ]
          ],
          related: ["cs/jvm-hip", "cs/pc-rejiseuteo-neitibeu-seutaek"]
        },
        {
          id: "cs/meseodeu-yeongyeok-metaspace",
          slug: "meseodeu-yeongyeok-metaspace",
          title: "메서드 영역 · Metaspace",
          deep: false,
          def: "클래스 구조, 메서드 바이트코드, static 변수, 런타임 상수 풀처럼 클래스 단위 정보를 저장하는 공유 영역이다.",
          why: "클래스 메타데이터가 어디에 쌓이는지 알아야 클래스를 동적으로 많이 만드는 환경에서 나는 `OutOfMemoryError: Metaspace`를 진단하고 막을 수 있기 때문이다.",
          how: [
            "클래스 로더가 클래스를 처음 로드할 때 그 클래스의 필드·메서드 정보와 바이트코드가 이곳에 올라간다.",
            "- Java 7까지는 힙의 일부인 PermGen에 있었고 크기가 고정되어 `OutOfMemoryError: PermGen space`가 자주 났다.",
            "- Java 8부터는 네이티브 메모리를 쓰는 Metaspace로 바뀌어 필요한 만큼 늘어난다. 상한은 `-XX:MaxMetaspaceSize`로 정한다.",
            "- String Pool과 static 변수가 가리키는 객체 자체는 힙에 있다."
          ],
          use: ["동적 프록시나 스크립트 엔진으로 클래스를 계속 만드는 애플리케이션은 Metaspace 사용량을 모니터링한다."],
          warn: ["클래스를 동적으로 계속 만드는 코드(프록시, 스크립트 엔진)나 클래스 로더 누수가 있으면 Metaspace OOM이 날 수 있다."],
          myth: [
            [
              "static 변수가 가리키는 객체도 Metaspace에 있다",
              "Metaspace에는 클래스 메타데이터가 있고, static 변수가 가리키는 객체와 String Pool은 힙에 있다."
            ]
          ],
          answer: "메서드 영역은 클래스 구조, 메서드 바이트코드, static 변수 같은 클래스 단위 정보를 저장하는 공유 영역입니다. Java 8부터는 고정 크기 PermGen 대신 네이티브 메모리를 쓰는 Metaspace로 바뀌어 필요한 만큼 늘어납니다.",
          followUps: [
            [
              "PermGen을 Metaspace로 바꾼 이유는 무엇인가요?",
              "PermGen은 크기가 고정되어 클래스가 많으면 OutOfMemoryError: PermGen space가 자주 났기 때문입니다. Metaspace는 네이티브 메모리를 써서 자동으로 늘어나고, 필요하면 MaxMetaspaceSize로 상한을 둡니다."
            ]
          ],
          related: ["cs/jvm-hip", "cs/keulraeseu-roding-jit"]
        },
        {
          id: "cs/pc-rejiseuteo-neitibeu-seutaek",
          slug: "pc-rejiseuteo-neitibeu-seutaek",
          title: "PC 레지스터 · 네이티브 스택",
          deep: false,
          def: "스레드마다 따로 있는 작은 영역으로, PC 레지스터는 현재 실행 중인 명령어 위치를, 네이티브 스택은 네이티브 코드 호출 정보를 담는다.",
          why: "여러 스레드가 CPU를 번갈아 쓸 때 각 스레드가 어디까지 실행했는지 잃지 않고, JNI 호출 정보를 자바 스택과 분리해 관리하기 위해서다.",
          how: [
            "- PC 레지스터: 스레드가 지금 어느 바이트코드 명령어를 실행하는지 가리킨다. 컨텍스트 스위칭 후 이어서 실행할 위치를 알기 위해 필요하다.",
            "- 네이티브 메서드 스택: JNI로 C/C++ 같은 네이티브 메서드를 호출할 때 쓰인다.",
            "두 영역 모두 스레드 생성 시 만들어지고 스레드가 끝나면 사라진다."
          ],
          use: ["스레드 덤프에서 각 스레드가 어느 줄을 실행 중인지 보이는 것은 스레드마다 실행 위치 정보가 있기 때문이다."],
          answer: "PC 레지스터는 스레드가 현재 실행 중인 바이트코드 명령어 위치를 가리키는 작은 영역입니다. 네이티브 메서드 스택은 JNI로 C/C++ 네이티브 코드를 호출할 때 쓰입니다. 둘 다 스레드마다 따로 생깁니다.",
          analogy: "PC 레지스터는 책을 읽다 멈춘 곳에 꽂아 두는 책갈피와 같습니다.",
          followUps: [["PC 레지스터가 스레드마다 필요한 이유는요?", "스레드는 컨텍스트 스위칭으로 실행이 중단되었다가 다시 이어지는데, 어디까지 실행했는지 각자 기억해야 하기 때문입니다."]],
          related: ["cs/jvm-seutaek"]
        },
        {
          id: "cs/keulraeseu-roding-jit",
          slug: "keulraeseu-roding-jit",
          title: "클래스 로딩 · JIT",
          deep: false,
          def: "클래스 로더가 필요한 시점에 클래스를 메모리에 올리고, JIT 컴파일러가 자주 실행되는 코드를 기계어로 바꿔 빠르게 실행하는 구조다.",
          why: "모든 클래스를 시작 시점에 올리면 메모리와 기동 시간이 낭비되고, 바이트코드를 매번 해석만 하면 반복 실행되는 코드가 느리기 때문이다.",
          how: [
            "1) 로딩: 클래스가 처음 쓰일 때 .class 파일을 읽는다. 부모 클래스 로더에게 먼저 맡기는 부모 위임 모델로 같은 클래스가 중복 로드되는 것을 막는다.",
            "2) 링킹: 바이트코드를 검증하고 static 변수 공간을 준비한다.",
            "3) 초기화: static 블록과 static 변수 초기값을 실행한다.",
            "JIT은 처음에는 인터프리터로 실행하다가 자주 호출되는 메서드(핫스팟)를 기계어로 컴파일해 캐시한다. 그래서 자바 애플리케이션은 기동 직후보다 조금 지나야 최고 성능이 난다(워밍업)."
          ],
          flow: ["클래스 첫 사용", "로딩(.class 읽기)", "링킹(검증·준비)", "초기화(static 실행)", "인터프리터 실행", "핫스팟은 JIT 컴파일"],
          use: ["배포 직후 응답이 느린 워밍업 구간을 줄이려고 헬스 체크 전에 주요 API를 미리 호출한다.", "GraalVM 네이티브 이미지나 CDS로 기동 시간을 줄인다."],
          answer: "클래스 로더는 클래스가 처음 쓰일 때 로딩, 링킹, 초기화 단계를 거쳐 메모리에 올립니다. 부모 위임 모델로 같은 클래스의 중복 로드를 막습니다. JIT 컴파일러는 자주 실행되는 코드를 기계어로 컴파일해 실행 속도를 높입니다.",
          analogy: "JIT은 자주 가는 길을 외워 두는 것과 같습니다. 처음엔 지도를 보며 가지만 자주 다니면 지도 없이 빠르게 갑니다.",
          followUps: [
            [
              "부모 위임 모델이란 무엇인가요?",
              "클래스 로딩 요청을 받으면 먼저 부모 클래스 로더에게 맡기고, 부모가 찾지 못할 때만 자신이 로드하는 방식입니다. 이 덕분에 java.lang.String 같은 핵심 클래스를 사용자가 바꿔치기할 수 없습니다."
            ]
          ],
          related: ["cs/meseodeu-yeongyeok-metaspace"]
        }
      ]
    },
    {
      name: "가비지 컬렉션",
      compare: {
        cols: ["기준", "G1 GC", "ZGC"],
        rows: [
          ["목표", "처리량과 정지 시간 균형", "초저지연(1ms 안팎)"],
          ["힙 관리", "같은 크기 Region", "Region + 컬러드 포인터"],
          ["정지 시간", "목표 200ms(기본)", "힙 크기와 거의 무관"],
          ["기본 여부", "Java 9부터 기본", "-XX:+UseZGC로 선택"],
          ["적합한 곳", "일반 서버 애플리케이션", "대용량 힙, 지연 민감 서비스"]
        ]
      },
      concepts: [
        {
          id: "cs/gc-dongjak-wonri",
          slug: "gc-dongjak-wonri",
          title: "GC 동작 원리",
          deep: true,
          def: "더 이상 참조되지 않는 객체를 찾아 힙 메모리를 자동으로 회수하는 JVM의 기능이다.",
          why: "개발자가 메모리를 직접 해제하면 해제를 잊는 누수나 이미 해제한 메모리를 쓰는 버그가 생긴다. GC는 이를 자동으로 처리해 안전성과 생산성을 높인다.",
          how: [
            "GC는 \"살아 있는 객체\"를 찾아 남기고 나머지를 버린다. 살아 있다는 기준은 GC 루트에서 참조를 따라 닿을 수 있는가(Reachability)다.",
            "- GC 루트: 실행 중인 스택 프레임의 지역 변수, static 변수, JNI 참조, 활성 스레드 등.",
            "1) Mark: GC 루트에서 시작해 참조를 따라가며 닿는 객체에 표시한다.",
            "2) Sweep: 표시되지 않은 객체의 메모리를 회수한다.",
            "3) Compact: 살아남은 객체를 한쪽으로 모아 메모리 단편화를 없앤다(컬렉터에 따라 다르다).",
            "서로만 참조하는 순환 참조 객체도 루트에서 닿지 않으면 회수된다. 참조 카운팅 방식이 아니기 때문이다.",
            "GC가 일하는 동안 애플리케이션 스레드가 멈추는 Stop-the-World가 생기며, GC 종류와 튜닝은 대부분 이 정지 시간을 줄이는 것이 목표다."
          ],
          flow: ["GC 루트 수집", "참조 따라가며 Mark", "표시 안 된 객체 Sweep", "살아남은 객체 Compact", "애플리케이션 재개"],
          code: "void example() {\n    Order a = new Order();   // 루트(지역 변수 a)에서 닿음 → 살아 있음\n    a = new Order();         // 처음 만든 Order는 이제 아무도 참조하지 않음 → GC 대상\n\n    Node x = new Node();\n    Node y = new Node();\n    x.next = y; y.next = x;  // 순환 참조\n    x = null; y = null;      // 루트에서 닿지 않으므로 둘 다 회수된다\n}",
          codeLang: "java",
          use: [
            "GC 로그(-Xlog:gc*)와 Micrometer GC 메트릭으로 정지 시간과 빈도를 모니터링한다.",
            "대용량 리스트를 오래 들고 있는 코드를 스트리밍 처리로 바꿔 GC 부담을 줄인다."
          ],
          warn: [
            "`System.gc()`는 GC를 요청할 뿐 실행을 보장하지 않으며, Full GC를 유발할 수 있어 운영 코드에서 호출하지 않는다.",
            "GC가 있어도 static 컬렉션, 캐시, ThreadLocal처럼 루트에서 계속 닿는 참조를 남기면 메모리 누수가 생긴다.",
            "`finalize()`는 Java 9부터 deprecated다. 자원 정리는 try-with-resources를 쓴다."
          ],
          myth: [
            ["순환 참조 객체는 GC가 회수하지 못한다", "자바 GC는 참조 카운팅이 아니라 도달 가능성으로 판단하므로, 루트에서 닿지 않으면 순환 참조여도 회수된다."],
            ["System.gc()를 호출하면 바로 GC가 실행된다", "GC를 요청할 뿐 실행을 보장하지 않으며, Full GC를 유발할 수 있어 운영 코드에서는 쓰지 않는다."]
          ],
          answer: "GC는 스택의 지역 변수나 static 변수 같은 GC 루트에서 참조를 따라가 닿을 수 없는 객체를 찾아 메모리를 회수합니다. Mark 단계에서 살아 있는 객체를 표시하고, Sweep 단계에서 나머지를 회수하며, 필요하면 Compact로 단편화를 정리합니다. 이 과정에서 애플리케이션이 멈추는 Stop-the-World가 생깁니다.",
          analogy: "건물 입구(GC 루트)에서 이어진 복도로 갈 수 있는 방만 남기고, 길이 끊긴 방은 철거하는 것과 같습니다.",
          qa: [
            "GC는 어떤 객체를 회수하나요?",
            "GC 루트, 즉 스택의 지역 변수나 static 변수 등에서 참조를 따라가 닿을 수 없는 객체를 회수합니다. Mark 단계에서 닿는 객체를 표시하고 Sweep 단계에서 나머지를 회수하며, 필요하면 Compact로 단편화를 정리합니다. 순환 참조여도 루트에서 닿지 않으면 회수됩니다."
          ],
          followUps: [
            [
              "GC 루트에는 무엇이 있나요?",
              "실행 중인 스레드의 스택 프레임에 있는 지역 변수와 매개변수, 클래스의 static 변수, JNI 참조, 활성 스레드 자체 등이 있습니다. 이들에서 시작해 참조를 따라갑니다."
            ],
            [
              "GC가 있는데도 메모리 누수가 생기는 이유는요?",
              "더 이상 쓰지 않는 객체를 static 컬렉션, 캐시, ThreadLocal, 리스너 목록 등이 계속 참조하고 있으면 루트에서 닿기 때문에 회수되지 않습니다. 사용이 끝나면 참조를 제거해야 합니다."
            ],
            [
              "Compact 단계는 왜 필요한가요?",
              "회수 후 빈 공간이 여기저기 흩어지면 큰 객체를 넣을 연속 공간이 없어집니다. 살아 있는 객체를 한쪽으로 모아 연속된 빈 공간을 만들기 위해 필요합니다."
            ]
          ],
          related: ["cs/sedaebyeol-gc", "cs/stop-the-world", "cs/jvm-hip"]
        },
        {
          id: "cs/sedaebyeol-gc",
          slug: "sedaebyeol-gc",
          title: "세대별 GC",
          deep: false,
          def: "\"대부분의 객체는 금방 쓰레기가 된다\"는 가설에 따라 힙을 Young과 Old 영역으로 나누어 관리하는 방식이다.",
          why: "힙 전체를 매번 검사하면 GC 비용이 힙 크기만큼 커지므로, 금방 죽는 객체가 모인 Young 영역만 자주 정리해 GC 비용을 줄이기 위해서다.",
          how: [
            "- Young 영역: 새 객체가 Eden에 생긴다. Eden이 가득 차면 Minor GC가 일어나 살아남은 객체를 Survivor 영역(S0, S1 중 하나)으로 옮긴다. 두 Survivor는 번갈아 쓰인다.",
            "- 승격: Minor GC에서 여러 번(age 임계값) 살아남은 객체는 Old 영역으로 옮겨진다.",
            "- Old 영역: 오래 사는 객체가 모인다. 가득 차면 Major GC 또는 Full GC가 일어나며 시간이 오래 걸린다.",
            "Young 영역은 대부분 죽은 객체라 살아남은 소수만 복사하면 되어 Minor GC가 매우 빠르다. 영역을 나누면 매번 힙 전체를 검사하지 않아도 된다."
          ],
          flow: ["Eden에 객체 생성", "Eden 가득 참", "Minor GC 실행", "생존 객체 Survivor로", "여러 번 생존 시 Old 승격", "Old 가득 차면 Major GC"],
          use: ["요청마다 만들고 버리는 DTO는 Young에서 빠르게 회수되므로 성능 걱정 없이 쓸 수 있다.", "Old 영역이 빠르게 차면 오래 살아남는 캐시나 세션 객체를 의심한다."],
          warn: ["큰 객체나 오래 들고 있는 캐시가 많으면 Old 영역이 빨리 차서 Full GC가 잦아진다."],
          answer: "세대별 GC는 대부분의 객체가 금방 쓰레기가 된다는 가설에 따라 힙을 Young과 Old로 나눕니다. 새 객체는 Eden에 생기고 Minor GC에서 살아남으면 Survivor로, 여러 번 살아남으면 Old로 승격됩니다. Young은 자주 빠르게, Old는 드물게 정리합니다.",
          analogy: "신입 사원(Young)은 자주 평가하고, 오래 다닌 직원(Old)은 가끔 평가하는 회사와 같습니다.",
          followUps: [
            [
              "Survivor 영역이 두 개인 이유는요?",
              "Minor GC 때 Eden과 한 Survivor의 생존 객체를 다른 빈 Survivor로 복사하면, 복사가 끝난 영역은 통째로 비울 수 있어 단편화가 생기지 않습니다. 두 영역을 번갈아 씁니다."
            ]
          ],
          related: ["cs/gc-dongjak-wonri", "cs/g1-gc"]
        },
        {
          id: "cs/stop-the-world",
          slug: "stop-the-world",
          title: "Stop-the-World",
          deep: false,
          def: "GC를 실행하기 위해 GC 스레드를 제외한 모든 애플리케이션 스레드가 멈추는 현상이다.",
          why: "GC가 애플리케이션을 멈추는 시간이 곧 응답 지연으로 이어지므로, GC 선택과 튜닝의 목표가 정지 시간을 줄이는 데 있음을 이해하기 위해서다.",
          how: [
            "객체 참조 관계가 바뀌는 도중에 살아 있는 객체를 판단하면 잘못 회수할 수 있으므로, GC는 일부 단계에서 애플리케이션을 멈춘다.",
            "- 영향: 정지 시간 동안 요청이 처리되지 않아 응답 지연(레이턴시 튀는 현상)이 생긴다.",
            "- 확인: GC 로그(`-Xlog:gc*`)나 Actuator·Micrometer의 GC pause 메트릭으로 정지 시간을 본다.",
            "G1, ZGC 같은 최신 컬렉터는 대부분의 작업을 애플리케이션과 동시에 수행해 정지 시간을 줄인다."
          ],
          use: ["API의 p99 응답 시간이 주기적으로 튀면 GC pause 메트릭과 시간대를 맞춰 본다."],
          answer: "Stop-the-World는 GC를 실행하려고 GC 스레드를 제외한 모든 애플리케이션 스레드가 멈추는 현상입니다. 이 시간 동안 요청이 처리되지 않아 응답 지연이 생기므로, GC 튜닝은 대부분 이 정지 시간을 줄이는 것이 목표입니다.",
          analogy: "대청소를 하는 동안 가게 문을 잠깐 닫는 것과 같습니다.",
          followUps: [
            [
              "정지 시간을 줄이는 방법은 무엇인가요?",
              "불필요한 객체 생성과 오래 사는 객체를 줄이고, 힙 크기를 적절히 조정하며, G1이나 ZGC처럼 동시 작업을 많이 하는 컬렉터를 선택합니다. GC 로그로 원인을 확인한 뒤 조정합니다."
            ]
          ],
          related: ["cs/gc-dongjak-wonri", "cs/zgc"]
        },
        {
          id: "cs/g1-gc",
          slug: "g1-gc",
          title: "G1 GC",
          deep: false,
          def: "힙을 같은 크기의 Region으로 나누고 쓰레기가 많은 Region부터 회수하는 GC로, Java 9부터 기본 컬렉터다.",
          why: "큰 힙에서 Old 영역 전체를 한 번에 정리하면 정지 시간이 길어지므로, Region 단위로 나눠 회수해 정지 시간을 목표치 안에 맞추기 위해서다.",
          how: [
            "- Region: 힙을 1~32MB 크기의 Region 수천 개로 나누고, 각 Region이 Eden, Survivor, Old, Humongous(아주 큰 객체) 역할을 맡는다.",
            "- Garbage First: 회수할 쓰레기가 가장 많은 Region부터 처리해 적은 시간에 많은 메모리를 확보한다.",
            "- 목표 정지 시간: `-XX:MaxGCPauseMillis`(기본 200ms)를 맞추도록 한 번에 처리할 Region 수를 조절한다.",
            "처리량과 정지 시간의 균형이 좋아 일반적인 서버 애플리케이션에 무난하다."
          ],
          use: ["대부분의 스프링 부트 서버는 별도 설정 없이 G1을 쓰고, 필요하면 -XX:MaxGCPauseMillis로 목표 정지 시간을 조정한다."],
          answer: "G1 GC는 힙을 같은 크기의 Region으로 나누고 쓰레기가 가장 많은 Region부터 회수하는 GC로, Java 9부터 기본 컬렉터입니다. 목표 정지 시간(기본 200ms)에 맞춰 한 번에 처리할 Region 수를 조절해 처리량과 정지 시간의 균형을 맞춥니다.",
          followUps: [
            [
              "G1이라는 이름의 의미는요?",
              "Garbage First의 줄임말로, 회수할 쓰레기가 가장 많은 Region부터 먼저 처리한다는 뜻입니다. 적은 시간에 많은 메모리를 확보하기 위한 전략입니다."
            ]
          ],
          related: ["cs/sedaebyeol-gc", "cs/zgc"]
        },
        {
          id: "cs/zgc",
          slug: "zgc",
          title: "ZGC",
          deep: false,
          def: "대부분의 GC 작업을 애플리케이션 실행과 동시에 수행해, 힙이 커도 정지 시간을 1ms 안팎으로 유지하는 저지연 GC다.",
          why: "수십 GB 이상의 큰 힙에서도 GC 정지 시간이 수 ms 안팎에 머물러야 하는 지연 민감 서비스의 요구를 맞추기 위해서다.",
          how: [
            "- 컬러드 포인터와 로드 배리어로 객체를 옮기는 작업까지 애플리케이션 스레드와 동시에 처리한다.",
            "- 수백 MB부터 수 TB 힙까지 정지 시간이 힙 크기에 거의 비례하지 않는다.",
            "- Java 15에서 정식 기능이 되었고, Java 21에서 세대별 ZGC가 추가되었으며 이후 버전에서 세대별 모드가 기본이 되었다.",
            "- `-XX:+UseZGC`로 켠다. 비슷한 목표의 컬렉터로 Shenandoah가 있다."
          ],
          use: ["수십 GB 힙을 쓰는 실시간 서비스나 지연에 민감한 API 서버에서 G1 대신 ZGC를 선택한다."],
          warn: ["정지 시간을 줄이는 대신 CPU와 메모리를 조금 더 쓰므로 처리량이 중요한 배치 작업에는 Parallel GC가 나을 수 있다."],
          answer: "ZGC는 객체 이동을 포함한 대부분의 GC 작업을 애플리케이션과 동시에 수행해, 힙이 커도 정지 시간을 1ms 안팎으로 유지하는 저지연 GC입니다. Java 21에서 세대별 ZGC가 추가되었고 -XX:+UseZGC로 켭니다.",
          analogy: "가게 문을 닫지 않고 손님이 있는 동안 조금씩 청소하는 방식입니다.",
          followUps: [
            [
              "ZGC가 항상 G1보다 좋은가요?",
              "아닙니다. 정지 시간은 짧지만 동시 작업 때문에 CPU와 메모리를 더 쓰므로, 처리량이 중요한 배치나 작은 힙에서는 G1이나 Parallel GC가 나을 수 있습니다."
            ]
          ],
          related: ["cs/g1-gc", "cs/stop-the-world"]
        }
      ]
    },
    {
      name: "객체 비교",
      compare: {
        cols: ["기준", "equals", "hashCode"],
        rows: [
          ["반환값", "boolean", "int"],
          ["역할", "논리적 동등성 판단", "해시 버킷 위치 결정"],
          ["기본 구현", "참조 비교(==)", "객체마다 다른 값"],
          ["규약 관계", "true면 hashCode 같아야 함", "같아도 equals는 다를 수 있음"]
        ]
      },
      concepts: [
        {
          id: "cs/equals",
          slug: "equals",
          title: "equals",
          deep: true,
          def: "두 객체의 내용(논리적 값)이 같은지 비교하는 `Object`의 메서드로, 기본 구현은 참조 비교(`==`)와 같다.",
          why: "값 객체, DTO, 맵의 키처럼 \"같은 값이면 같은 것\"으로 취급해야 하는 객체는 인스턴스가 달라도 같다고 판단해야 한다. 컬렉션의 `contains`, `remove`, `indexOf`도 모두 equals로 비교한다.",
          how: [
            "`==`는 두 변수가 같은 인스턴스를 가리키는지(참조) 비교하고, `equals`는 재정의하면 값이 같은지 비교한다.",
            "재정의할 때 지켜야 하는 규약:",
            "- 반사성: `x.equals(x)`는 true.",
            "- 대칭성: `x.equals(y)`가 true면 `y.equals(x)`도 true.",
            "- 추이성: x=y이고 y=z면 x=z.",
            "- 일관성: 값이 바뀌지 않으면 여러 번 호출해도 결과가 같다.",
            "- null 비교: `x.equals(null)`은 false.",
            "equals를 재정의하면 반드시 hashCode도 함께 재정의해야 한다."
          ],
          flow: ["같은 참조면 true", "null·타입 검사", "대상 타입으로 캐스팅", "핵심 필드 값 비교", "hashCode도 함께 재정의"],
          code: "public final class Money {\n    private final long amount;\n    private final String currency;\n\n    @Override\n    public boolean equals(Object o) {\n        if (this == o) return true;\n        if (!(o instanceof Money other)) return false;\n        return amount == other.amount && currency.equals(other.currency);\n    }\n\n    @Override\n    public int hashCode() {\n        return Objects.hash(amount, currency);\n    }\n}\n// record Money(long amount, String currency) {} 로 쓰면 자동 생성된다",
          codeLang: "java",
          use: [
            "금액, 좌표 같은 값 객체를 record로 만들어 equals와 hashCode를 자동 생성한다.",
            "래퍼 타입(Integer, Long)의 값 비교는 항상 equals로 한다."
          ],
          warn: [
            "Integer는 -128~127만 캐시되어 그 범위 밖에서 `==`로 비교하면 값이 같아도 false가 된다. 래퍼 타입은 equals로 비교한다.",
            "상속 관계에서 하위 클래스가 필드를 추가하면 대칭성과 추이성을 지키기 어렵다. 값 클래스는 final로 만들거나 record를 쓴다.",
            "JPA 엔티티는 프록시 객체일 수 있어 `getClass()` 비교 대신 `instanceof`와 getter를 쓴다."
          ],
          myth: [["Integer는 ==로 비교해도 된다", "-128~127만 캐시되어 같은 객체이고, 그 밖의 값은 서로 다른 객체라 ==가 false가 된다."]],
          answer: "equals는 두 객체의 논리적 값이 같은지 비교하는 메서드입니다. Object의 기본 구현은 ==와 같은 참조 비교라서, 값으로 같음을 판단해야 하는 클래스는 재정의해야 합니다. 재정의할 때는 반사성, 대칭성, 추이성, 일관성 규약을 지키고 hashCode도 함께 재정의합니다.",
          analogy: "==는 같은 사람인지(주민번호) 보는 것이고, equals는 같은 금액의 지폐인지 보는 것입니다.",
          qa: [
            "==와 equals의 차이는 무엇인가요?",
            "==는 두 참조가 같은 인스턴스를 가리키는지 비교하고, equals는 객체의 논리적 값이 같은지 비교하도록 재정의하는 메서드입니다. Object의 기본 equals는 ==와 같아서, 값 비교가 필요한 클래스는 equals를 재정의해야 하고 이때 hashCode도 함께 재정의해야 합니다."
          ],
          followUps: [
            [
              "equals를 재정의할 때 instanceof와 getClass 중 무엇을 쓰나요?",
              "instanceof는 하위 클래스도 같다고 볼 수 있고, getClass는 정확히 같은 클래스만 같다고 봅니다. 값 클래스를 final로 만들면 instanceof로 충분하고, JPA 엔티티는 프록시 때문에 instanceof를 써야 합니다."
            ],
            [
              "상속 관계에서 equals 규약이 깨지는 이유는요?",
              "하위 클래스가 필드를 추가하고 그 필드까지 비교하면, 부모와 자식을 비교할 때 대칭성이나 추이성이 깨집니다. 그래서 값 클래스는 상속 대신 조합을 쓰거나 final로 만듭니다."
            ]
          ],
          related: ["cs/hashcode", "cs/string-bulbyeonseong"]
        },
        {
          id: "cs/hashcode",
          slug: "hashcode",
          title: "hashCode",
          deep: true,
          def: "객체를 해시 기반 컬렉션에 저장할 때 쓰는 정수값을 반환하는 메서드로, equals가 같은 객체는 반드시 같은 값을 반환해야 한다.",
          why: "HashMap과 HashSet은 hashCode로 버킷을 먼저 찾고, 그 버킷 안에서만 equals로 비교한다. hashCode가 일관되지 않으면 같은 값의 객체를 찾지 못한다.",
          how: [
            "규약:",
            "- equals가 true인 두 객체는 반드시 같은 hashCode를 반환한다.",
            "- hashCode가 같다고 equals가 true일 필요는 없다(해시 충돌).",
            "- 객체가 바뀌지 않으면 여러 번 호출해도 같은 값을 반환한다.",
            "HashSet에서 `contains(x)`가 동작하는 순서:",
            "1) `x.hashCode()`로 버킷 위치를 계산한다.",
            "2) 그 버킷에 있는 원소들과 `equals`로 비교한다.",
            "equals만 재정의하고 hashCode를 그대로 두면 값이 같은 두 객체가 서로 다른 버킷에 들어가, 중복 제거가 안 되고 `contains`가 false를 반환한다."
          ],
          flow: ["hashCode 호출", "버킷 위치 계산", "버킷 안 원소와 equals 비교", "일치하면 찾음"],
          code: "class Point {\n    final int x, y;\n    Point(int x, int y) { this.x = x; this.y = y; }\n\n    @Override public boolean equals(Object o) {\n        return o instanceof Point p && x == p.x && y == p.y;\n    }\n    // hashCode를 재정의하지 않으면:\n    // set.add(new Point(1, 2));\n    // set.contains(new Point(1, 2)) → false\n    @Override public int hashCode() { return Objects.hash(x, y); }\n}",
          codeLang: "java",
          use: [
            "DTO를 Set이나 Map의 키로 쓸 때 Lombok @EqualsAndHashCode나 record로 둘을 함께 만든다.",
            "캐시 키 객체는 불변 필드로 hashCode를 계산해 저장 후 값이 바뀌지 않게 한다."
          ],
          warn: [
            "hashCode에 쓰는 필드가 바뀌면 HashSet에 넣은 객체를 다시 찾을 수 없다. 불변 필드로 계산한다.",
            "모든 객체에 같은 값을 반환해도 규약은 지키지만, 모두 한 버킷에 몰려 조회가 O(n)으로 느려진다.",
            "IDE 생성, `Objects.hash()`, Lombok `@EqualsAndHashCode`, record를 쓰면 실수를 줄인다."
          ],
          myth: [["hashCode가 같으면 같은 객체다", "hashCode가 같아도 equals가 다를 수 있다(해시 충돌). 같음의 최종 판단은 equals가 한다."]],
          answer: "hashCode는 해시 기반 컬렉션에서 버킷 위치를 정하는 정수값을 반환합니다. equals가 true인 두 객체는 반드시 같은 hashCode를 반환해야 합니다. 이를 어기면 HashMap이나 HashSet에서 같은 값의 객체를 찾지 못하고 중복도 제거되지 않습니다.",
          analogy: "도서관의 서가 번호와 같습니다. 서가 번호로 먼저 칸을 찾고, 그 칸 안에서 책 제목(equals)으로 찾습니다.",
          qa: [
            "equals와 hashCode를 함께 재정의해야 하는 이유는?",
            "HashMap이나 HashSet은 hashCode로 버킷을 찾은 뒤 equals로 비교합니다. equals만 재정의하면 값이 같은 두 객체의 hashCode가 달라 서로 다른 버킷에 저장되므로, 같은 키로 값을 찾지 못하거나 중복이 제거되지 않습니다. 그래서 equals가 같으면 hashCode도 같아야 한다는 규약을 지켜야 합니다."
          ],
          followUps: [
            [
              "모든 객체가 같은 hashCode를 반환하면 어떻게 되나요?",
              "규약 위반은 아니지만 모든 객체가 한 버킷에 몰려 조회가 O(1)에서 O(n)으로 느려집니다. 자바 HashMap은 이때 버킷을 트리로 바꿔 O(log n)으로 완화합니다."
            ],
            [
              "HashSet에 넣은 뒤 객체 필드를 바꾸면 어떻게 되나요?",
              "hashCode에 쓰인 필드가 바뀌면 hashCode가 달라져 원래 저장된 버킷이 아닌 곳을 찾게 되므로 contains와 remove가 실패합니다. 그래서 hashCode는 불변 필드로 계산합니다."
            ]
          ],
          related: ["cs/equals"]
        }
      ]
    },
    {
      name: "문자열",
      compare: {
        cols: ["기준", "String 불변성", "StringBuilder"],
        rows: [
          ["가변성", "불변", "가변"],
          ["연결 시", "매번 새 객체 생성", "같은 버퍼에 추가"],
          ["스레드 안전", "안전(불변)", "안전하지 않음"],
          ["적합한 곳", "키, 상수, 일반 값", "반복문 안 문자열 조립"]
        ]
      },
      concepts: [
        {
          id: "cs/string-bulbyeonseong",
          slug: "string-bulbyeonseong",
          title: "String 불변성",
          deep: false,
          def: "String 객체는 한 번 만들어지면 내용을 바꿀 수 없으며, 바꾸는 것처럼 보이는 연산은 모두 새 객체를 만든다.",
          why: "문자열을 여러 곳에서 공유해도 누군가 내용을 바꿀 걱정이 없어야 String Pool, 해시 캐싱, 스레드 안전, 보안 검증이 안전하게 동작하기 때문이다.",
          how: [
            "`s.toUpperCase()`, `s + \"a\"`, `s.replace(...)`는 기존 문자열을 그대로 두고 새 String을 반환한다.",
            "- 해시 캐싱: hashCode를 한 번 계산해 저장해 두므로 HashMap의 키로 빠르게 쓰인다.",
            "- 보안: 파일 경로, DB URL, 클래스 이름 같은 값이 검증 후에 바뀌는 것을 막는다.",
            "- 스레드 안전: 바뀌지 않으므로 동기화 없이 여러 스레드가 공유할 수 있다.",
            "- 공유 가능: 불변이라서 String Pool로 같은 문자열을 공유할 수 있다."
          ],
          use: ["HashMap의 키로 String을 주로 쓰는 이유는 불변이라 해시값이 바뀌지 않기 때문이다."],
          warn: ["비밀번호처럼 민감한 값은 String으로 두면 GC 전까지 메모리에 남으므로, 보안이 중요한 API는 `char[]`로 받아 사용 후 지운다."],
          myth: [["s.toUpperCase()를 호출하면 s가 바뀐다", "s는 그대로이고 대문자로 바뀐 새 문자열이 반환된다. 결과를 변수에 다시 대입해야 한다."]],
          answer: "String은 한 번 만들어지면 내용을 바꿀 수 없는 불변 객체입니다. 덕분에 String Pool로 같은 문자열을 공유하고, hashCode를 캐싱해 HashMap 키로 빠르게 쓰이며, 동기화 없이 여러 스레드가 공유할 수 있습니다. 바꾸는 연산은 모두 새 객체를 만듭니다.",
          analogy: "돌에 새긴 글자와 같습니다. 고치려면 새 돌을 깎아야 합니다.",
          followUps: [
            [
              "String을 불변으로 설계한 이유는 무엇인가요?",
              "String Pool로 메모리를 공유하고, 해시값을 캐싱하며, 파일 경로나 URL 같은 값이 검증 후 바뀌는 보안 문제를 막고, 동기화 없이 스레드 간에 공유하기 위해서입니다."
            ]
          ],
          related: ["cs/string-pool", "cs/stringbuilder"]
        },
        {
          id: "cs/string-pool",
          slug: "string-pool",
          title: "String Pool",
          deep: false,
          def: "문자열 리터럴을 힙의 특별한 영역에 하나만 저장해 같은 값을 여러 변수가 공유하게 하는 저장소다.",
          why: "같은 내용의 문자열 리터럴을 매번 새 객체로 만들면 메모리가 낭비되므로, 하나의 인스턴스를 재사용해 메모리를 아끼기 위해서다.",
          how: [
            "`String a = \"hello\"; String b = \"hello\";`면 a와 b는 같은 객체를 가리켜 `a == b`가 true다.",
            "`new String(\"hello\")`는 풀을 쓰지 않고 힙에 새 객체를 만들어 `==` 비교가 false가 된다.",
            "`intern()`을 호출하면 풀에 있는 같은 값의 객체를 돌려받는다.",
            "Java 7부터 String Pool은 PermGen이 아닌 힙에 있어 GC 대상이 된다."
          ],
          use: ["코드 리뷰에서 문자열을 ==로 비교하는 코드를 찾아 equals로 바꾼다."],
          warn: ["문자열 비교는 풀 여부와 상관없이 항상 `equals`로 한다."],
          myth: [["같은 내용의 문자열은 항상 ==가 true다", "리터럴끼리는 같은 객체지만 new String이나 런타임에 만든 문자열은 다른 객체라 false가 될 수 있다."]],
          answer: "String Pool은 문자열 리터럴을 힙의 특별한 영역에 하나만 저장해 같은 값을 공유하는 저장소입니다. 같은 리터럴은 같은 객체를 가리키지만 new String으로 만들면 새 객체가 생깁니다. 그래서 문자열 비교는 항상 equals로 합니다.",
          followUps: [
            [
              "intern()은 무엇인가요?",
              "문자열을 String Pool에서 찾아 같은 값이 있으면 그 객체를, 없으면 풀에 넣고 그 객체를 반환하는 메서드입니다. 같은 값의 문자열이 매우 많을 때 메모리를 줄이는 데 쓸 수 있습니다."
            ]
          ],
          related: ["cs/string-bulbyeonseong"]
        },
        {
          id: "cs/stringbuilder",
          slug: "stringbuilder",
          title: "StringBuilder",
          deep: false,
          def: "내부 버퍼를 직접 수정하는 가변 문자열 클래스로, 문자열을 반복해서 이어 붙일 때 쓴다.",
          why: "반복문에서 String을 `+`로 이어 붙이면 매번 새 객체가 생겨 시간과 메모리가 낭비되므로, 하나의 버퍼에 이어 쓰기 위해서다.",
          how: [
            "반복문 안에서 `result += s`를 하면 매번 새 String이 생겨 O(n²)에 가까운 복사가 일어난다. StringBuilder는 하나의 버퍼에 추가하므로 훨씬 빠르다.",
            "- `StringBuilder`: 동기화가 없어 빠르다. 대부분 이것을 쓴다.",
            "- `StringBuffer`: 모든 메서드가 synchronized다. 여러 스레드가 같은 버퍼를 공유할 때만 쓴다.",
            "한 줄짜리 단순 연결(`\"a\" + b + \"c\"`)은 컴파일러가 알아서 최적화하므로 굳이 바꿀 필요가 없다."
          ],
          use: ["대량의 CSV 줄이나 SQL 문을 조립할 때 StringBuilder로 한 번에 만든다."],
          myth: [["모든 문자열 연결에 StringBuilder를 써야 한다", "한 줄짜리 단순 연결은 컴파일러가 최적화하므로 + 로 써도 된다. 반복문 안에서 누적할 때 쓰면 된다."]],
          answer: "StringBuilder는 내부 버퍼를 직접 수정하는 가변 문자열 클래스로, 반복문에서 문자열을 이어 붙일 때 씁니다. String으로 반복 연결하면 매번 새 객체가 생겨 느립니다. 여러 스레드가 공유해야 할 때만 동기화된 StringBuffer를 씁니다.",
          followUps: [
            [
              "StringBuilder와 StringBuffer의 차이는요?",
              "StringBuffer는 모든 메서드가 synchronized라 스레드 안전하지만 느리고, StringBuilder는 동기화가 없어 빠릅니다. 대부분 지역 변수로 쓰므로 StringBuilder를 씁니다."
            ]
          ],
          related: ["cs/string-bulbyeonseong"]
        }
      ]
    },
    {
      name: "예외",
      compare: {
        cols: ["기준", "체크 예외", "언체크 예외"],
        rows: [
          ["상속", "Exception(런타임 제외)", "RuntimeException"],
          ["처리 강제", "컴파일러가 강제", "강제하지 않음"],
          ["대표 예", "IOException, SQLException", "NPE, IllegalArgumentException"],
          ["스프링 롤백", "기본 커밋", "기본 롤백"]
        ]
      },
      concepts: [
        {
          id: "cs/chekeu-yeoe",
          slug: "chekeu-yeoe",
          title: "체크 예외",
          deep: false,
          def: "`Exception`을 상속하지만 `RuntimeException`은 아닌 예외로, 컴파일러가 처리(catch 또는 throws)를 강제한다.",
          why: "파일이나 네트워크처럼 호출자가 복구할 수 있는 실패를 컴파일러가 처리하도록 강제해, 예외 처리를 빠뜨리지 않게 하기 위해서다.",
          how: [
            "대표 예: `IOException`, `SQLException`, `InterruptedException`.",
            "호출자가 복구할 수 있는 상황을 알리려는 의도로 설계되었다.",
            "- 문제점: 실제로는 복구할 방법이 없는 경우가 많아 모든 계층에 `throws`가 퍼지고, 의미 없는 catch로 예외를 삼키는 코드가 생긴다.",
            "- 기술 종속: `throws SQLException`이 서비스까지 올라오면 서비스가 JDBC에 묶인다."
          ],
          use: ["파일을 읽다 IOException이 나면 원인을 담은 언체크 예외로 감싸 공통 예외 처리기로 보낸다."],
          warn: ["catch한 뒤 아무것도 하지 않고 삼키지 않는다. 최소한 로그를 남기거나 언체크 예외로 감싸 다시 던진다."],
          myth: [["체크 예외가 나면 스프링 트랜잭션이 롤백된다", "스프링은 기본적으로 체크 예외에서 커밋한다. 롤백하려면 rollbackFor를 지정해야 한다."]],
          answer: "체크 예외는 RuntimeException이 아닌 Exception 하위 예외로, 컴파일러가 catch나 throws로 처리하도록 강제합니다. 복구 가능한 상황을 알리려는 의도지만, 실제로는 복구할 수 없는 경우가 많아 throws가 모든 계층에 퍼지는 문제가 있습니다.",
          followUps: [
            [
              "체크 예외를 언체크 예외로 바꾸는 이유는요?",
              "복구할 수 없는 체크 예외를 계속 throws로 넘기면 상위 계층이 JDBC 같은 기술에 의존하게 되고 코드가 지저분해지기 때문입니다. 원인을 담아 언체크 예외로 감싸고 한 곳에서 처리합니다."
            ]
          ],
          related: ["cs/eonchekeu-yeoe", "cs/yeoe-jeonhwan"]
        },
        {
          id: "cs/eonchekeu-yeoe",
          slug: "eonchekeu-yeoe",
          title: "언체크 예외",
          deep: false,
          def: "`RuntimeException`을 상속한 예외로, 컴파일러가 처리를 강제하지 않는다.",
          why: "복구할 수 없는 프로그래밍 오류마다 `throws`와 try-catch를 강제하면 코드가 오염되므로, 처리할 수 있는 곳에서만 잡도록 하기 위해서다.",
          how: [
            "대표 예: `NullPointerException`, `IllegalArgumentException`, `IllegalStateException`, `IndexOutOfBoundsException`.",
            "주로 프로그래밍 오류나 복구할 수 없는 상황을 나타낸다.",
            "최근 실무와 스프링은 언체크 예외를 기본으로 쓴다. 스프링 트랜잭션도 기본적으로 언체크 예외에서만 롤백한다.",
            "`Error`(OutOfMemoryError 등)는 예외가 아닌 시스템 오류로, 애플리케이션이 잡지 않는다."
          ],
          use: ["비즈니스 규칙 위반을 BusinessException(언체크)으로 정의하고 @RestControllerAdvice에서 에러 코드로 변환한다."],
          answer: "언체크 예외는 RuntimeException을 상속한 예외로, 컴파일러가 처리를 강제하지 않습니다. 주로 프로그래밍 오류나 복구할 수 없는 상황을 나타내며, 최근 실무와 스프링은 언체크 예외를 기본으로 씁니다.",
          followUps: [
            [
              "Error와 Exception은 어떻게 다른가요?",
              "Error는 OutOfMemoryError처럼 JVM이나 시스템 수준의 심각한 문제로 애플리케이션이 잡아 처리하지 않습니다. Exception은 애플리케이션이 처리할 수 있는 문제입니다."
            ]
          ],
          related: ["cs/chekeu-yeoe", "cs/yeoe-jeonhwan"]
        },
        {
          id: "cs/yeoe-jeonhwan",
          slug: "yeoe-jeonhwan",
          title: "예외 전환",
          deep: false,
          def: "하위 계층의 예외를 잡아 의미가 더 분명한 다른 예외로 감싸서 다시 던지는 기법이다.",
          why: "하위 계층의 `SQLException` 같은 기술 예외가 상위 계층까지 새어 나가 의존을 만드는 것을 막고, 원인은 보존한 채 의미 있는 예외로 바꾸기 위해서다.",
          how: [
            "`catch (SQLException e) { throw new OrderSaveException(\"주문 저장 실패\", e); }`처럼 원인 예외를 생성자에 넘긴다.",
            "- 기술 감추기: 서비스가 JDBC, JPA 같은 기술 예외에 의존하지 않게 된다. 스프링은 SQLException을 `DataAccessException` 계층으로 바꿔 준다.",
            "- 의미 부여: 비즈니스 맥락이 담긴 예외로 바꿔 공통 예외 처리기에서 알맞은 응답으로 바꾸기 쉽다."
          ],
          flow: ["하위 예외 catch", "의미 있는 예외 생성", "원인(cause) 전달", "새 예외 throw", "공통 처리기에서 응답"],
          use: ["스프링은 JDBC의 SQLException을 DuplicateKeyException 같은 DataAccessException 계층으로 바꿔 준다."],
          warn: ["원인(cause)을 넘기지 않으면 원래 스택 트레이스가 사라져 디버깅이 매우 어려워진다."],
          myth: [["예외를 감싸면 원래 오류 정보가 사라진다", "생성자에 원인 예외를 넘기면 Caused by로 원래 스택 트레이스가 함께 출력된다."]],
          answer: "예외 전환은 하위 계층의 예외를 잡아 의미가 분명한 다른 예외로 감싸 다시 던지는 기법입니다. 기술 예외를 감추고 비즈니스 맥락을 담을 수 있습니다. 이때 원인 예외를 생성자에 넘겨야 원래 스택 트레이스가 보존됩니다.",
          followUps: [
            [
              "예외를 감쌀 때 가장 흔한 실수는 무엇인가요?",
              "원인 예외를 넘기지 않고 메시지만 새로 만드는 것입니다. 그러면 실제로 어디서 왜 실패했는지 알 수 없어 장애 분석이 매우 어려워집니다."
            ]
          ],
          related: ["cs/chekeu-yeoe", "cs/eonchekeu-yeoe"]
        }
      ]
    },
    {
      name: "제네릭",
      compare: {
        cols: ["기준", "제네릭", "타입 소거", "와일드카드 · PECS"],
        rows: [
          ["무엇인가", "타입 매개변수화", "런타임 타입 정보 제거", "`?`로 타입 범위 표현"],
          ["작동 시점", "컴파일 시 타입 검사", "컴파일 후 바이트코드", "컴파일 시 검사"],
          ["장점·이유", "캐스팅 제거, 타입 안전", "하위 호환 유지", "API 유연성"],
          ["제약·규칙", "기본형 불가 (`int`)", "`new T()`, `instanceof` 불가", "생산자 extends, 소비자 super"]
        ]
      },
      concepts: [
        {
          id: "cs/jenerik",
          slug: "jenerik",
          title: "제네릭",
          deep: false,
          def: "클래스나 메서드에서 쓸 타입을 바깥에서 지정하게 해 컴파일 시점에 타입을 검사하는 기능이다.",
          why: "컬렉션에서 꺼낼 때마다 캐스팅하고 잘못된 타입이 런타임에야 `ClassCastException`으로 터지는 문제를 컴파일 시점에 잡기 위해서다.",
          how: [
            "`List<String>`에 Integer를 넣으면 컴파일 오류가 나고, 꺼낼 때 `(String)` 캐스팅이 필요 없다.",
            "- 제네릭 클래스: `class Box<T> { T value; }`",
            "- 제네릭 메서드: `static <T> T first(List<T> list)`",
            "- 타입 제한: `<T extends Comparable<T>>`처럼 상한을 두면 T의 메서드를 쓸 수 있다.",
            "런타임 ClassCastException을 컴파일 오류로 앞당겨 잡아 준다는 것이 핵심 이점이다."
          ],
          use: ["공통 API 응답을 ApiResponse<T>로 만들어 어떤 데이터 타입이든 같은 형식으로 감싼다."],
          answer: "제네릭은 클래스나 메서드에서 쓸 타입을 외부에서 지정하게 해 컴파일 시점에 타입을 검사하는 기능입니다. 잘못된 타입을 넣으면 컴파일 오류가 나고, 꺼낼 때 캐스팅이 필요 없습니다. 런타임 ClassCastException을 컴파일 단계로 앞당겨 잡아 줍니다.",
          followUps: [
            [
              "로 타입(raw type)을 쓰면 안 되는 이유는요?",
              "List처럼 타입 인자 없이 쓰면 컴파일러가 타입을 검사하지 못해 제네릭의 안전성을 잃고, 런타임에 ClassCastException이 날 수 있기 때문입니다."
            ]
          ],
          related: ["cs/taip-sogeo", "cs/waildeukadeu-pecs"]
        },
        {
          id: "cs/taip-sogeo",
          slug: "taip-sogeo",
          title: "타입 소거",
          deep: false,
          def: "하위 호환을 위해 컴파일 후 바이트코드에서 제네릭 타입 정보를 지우는 자바의 제네릭 구현 방식이다.",
          why: "제네릭 타입 정보가 런타임에 사라져 `new T()`나 `instanceof List<String>`이 안 되는 이유를 이해하고 우회 방법을 알기 위해서다.",
          how: [
            "`List<String>`과 `List<Integer>`는 런타임에 모두 `List`가 되고, `T`는 Object(또는 상한 타입)로 바뀌며 필요한 곳에 캐스팅이 들어간다.",
            "- 런타임에 `new T()`, `T.class`, `instanceof List<String>`을 쓸 수 없다.",
            "- 제네릭 배열 `new T[]`를 만들 수 없다.",
            "- Jackson이나 RestClient로 `List<User>`를 역직렬화할 때 타입 정보가 없어 `TypeReference`, `ParameterizedTypeReference`로 타입을 따로 전달한다."
          ],
          use: ["Jackson으로 List<User>를 역직렬화할 때 new TypeReference<List<User>>() {}로 타입 정보를 따로 넘긴다."],
          answer: "타입 소거는 하위 호환을 위해 컴파일 후 제네릭 타입 정보를 지우는 방식입니다. 런타임에는 List<String>과 List<Integer>가 같은 List이고, T는 Object나 상한 타입으로 바뀝니다. 그래서 new T()나 T.class를 쓸 수 없습니다.",
          followUps: [
            [
              "TypeReference는 어떻게 타입 정보를 얻나요?",
              "익명 하위 클래스를 만들면 부모 클래스의 제네릭 타입 정보가 클래스 메타데이터에 남습니다. 라이브러리는 리플렉션으로 이 정보를 읽어 실제 타입을 알아냅니다."
            ]
          ],
          related: ["cs/jenerik"]
        },
        {
          id: "cs/waildeukadeu-pecs",
          slug: "waildeukadeu-pecs",
          title: "와일드카드 · PECS",
          deep: false,
          def: "`?`로 \"어떤 타입이든\"을 표현하고, extends와 super로 범위를 정해 제네릭 메서드를 유연하게 만드는 문법이다.",
          why: "`List<Integer>`가 `List<Number>`의 하위 타입이 아니라서 생기는 불편을 해결하고, 읽기와 쓰기에 맞는 유연한 API를 만들기 위해서다.",
          how: [
            "- `<? extends T>`: T와 그 하위 타입. 안에서 값을 꺼내 읽기만 할 때 쓴다(생산자). 값을 넣을 수는 없다.",
            "- `<? super T>`: T와 그 상위 타입. 안에 값을 넣을 때 쓴다(소비자).",
            "- PECS: Producer-Extends, Consumer-Super로 기억한다.",
            "예: `Collections.copy(List<? super T> dest, List<? extends T> src)`는 src에서 읽고 dest에 쓴다."
          ],
          use: ["합계를 구하는 유틸 메서드를 sum(List<? extends Number>)로 만들어 Integer와 Long 리스트를 모두 받는다."],
          answer: "와일드카드는 제네릭에서 ?로 여러 타입을 받게 하는 문법입니다. 값을 꺼내 읽기만 하면 ? extends T, 값을 넣기만 하면 ? super T를 씁니다. 이를 Producer-Extends, Consumer-Super, 줄여서 PECS라고 합니다.",
          analogy: "? extends는 과일 바구니에서 꺼내기만 하는 손님, ? super는 바구니에 넣기만 하는 직원입니다.",
          followUps: [
            [
              "List<Object>에 List<String>을 넘길 수 없는 이유는요?",
              "제네릭은 무공변이라 String이 Object의 하위 타입이어도 List<String>은 List<Object>의 하위 타입이 아닙니다. 허용하면 그 리스트에 Integer를 넣을 수 있어 타입 안전성이 깨지기 때문입니다."
            ]
          ],
          related: ["cs/jenerik"]
        }
      ]
    },
    {
      name: "Java 버전별 기능",
      compare: {
        cols: ["개념", "출시", "대표 기능"],
        rows: [
          ["Java 8", "2014 LTS", "람다, 스트림, `Optional`"],
          ["Java 11", "2018 LTS", "`HttpClient`, `var` 람다"],
          ["Java 17", "2021 LTS", "record, sealed, 부트 3 최소"],
          ["Java 21", "2023 LTS", "가상 스레드, 패턴 매칭 switch"],
          ["Java 25", "2025.09 LTS", "Scoped Values, 간결한 main"]
        ]
      },
      concepts: [
        {
          id: "cs/java-8",
          slug: "java-8",
          title: "Java 8",
          deep: false,
          def: "2014년 LTS 버전으로, 람다와 스트림을 도입해 현대 자바의 출발점이 된 버전이다.",
          why: "람다, 스트림, `Optional`, 새 날짜 API가 이후 자바 코드 스타일의 기반이 되었으므로, 현대 자바 코드를 읽고 쓰기 위해 알아야 하기 때문이다.",
          how: [
            "- 람다와 함수형 인터페이스: `list.forEach(x -> System.out.println(x))`",
            "- 스트림 API: `filter`, `map`, `collect`로 컬렉션을 선언적으로 처리한다.",
            "- `Optional`: null일 수 있는 반환값을 명시한다.",
            "- 새 날짜·시간 API: `LocalDate`, `LocalDateTime`, `ZonedDateTime`(불변, 스레드 안전).",
            "- 인터페이스 default·static 메서드, PermGen을 대체한 Metaspace."
          ],
          use: [
            "컬렉션 가공 로직을 for문 대신 스트림의 filter, map, collect로 선언적으로 작성한다.",
            "Date와 Calendar 대신 불변이고 스레드 안전한 LocalDateTime을 쓴다."
          ],
          answer: "Java 8은 람다와 함수형 인터페이스, 스트림 API, Optional, 새 날짜·시간 API를 도입한 LTS 버전으로 현대 자바의 출발점입니다. 인터페이스 default 메서드와 Metaspace도 이때 들어왔습니다.",
          followUps: [
            [
              "스트림을 쓸 때 주의할 점은요?",
              "스트림은 한 번만 소비할 수 있고, 중간 연산은 최종 연산이 호출될 때 실행됩니다. 단순 반복이나 성능이 중요한 루프에서는 for문이 더 읽기 쉽고 빠를 수 있습니다."
            ]
          ],
          related: ["cs/java-11"]
        },
        {
          id: "cs/java-11",
          slug: "java-11",
          title: "Java 11",
          deep: false,
          def: "2018년 LTS 버전으로, 표준 HTTP 클라이언트와 문자열 편의 메서드가 추가되었다.",
          why: "Java 8 이후 첫 LTS로 많은 서비스가 운영 기준으로 삼았기 때문에, `var`, `HttpClient` 같은 변화를 알아야 실무 코드를 이해할 수 있기 때문이다.",
          how: [
            "- 표준 `HttpClient`: HTTP/2와 비동기 호출을 지원한다.",
            "- `String`의 `isBlank()`, `strip()`, `lines()`, `repeat()`.",
            "- 람다 파라미터에 `var` 사용. 지역 변수 타입 추론 `var` 자체는 Java 10에서 들어왔다.",
            "- 소스 파일 하나를 컴파일 없이 `java Hello.java`로 실행할 수 있다."
          ],
          use: ["외부 라이브러리 없이 java.net.http.HttpClient로 HTTP/2 호출을 한다."],
          answer: "Java 11은 표준 HttpClient, String의 isBlank와 strip 같은 편의 메서드, 람다 파라미터 var를 추가한 LTS 버전입니다. 소스 파일 하나를 컴파일 없이 실행하는 기능도 들어왔습니다.",
          followUps: [
            [
              "var를 쓰면 타입 안전성이 사라지나요?",
              "아닙니다. var는 컴파일러가 대입 값으로 타입을 추론하는 것이라 정적 타입은 그대로 유지됩니다. 다만 타입이 드러나지 않아 가독성이 떨어지는 곳에서는 피합니다."
            ]
          ],
          related: ["cs/java-8", "cs/java-17"]
        },
        {
          id: "cs/java-17",
          slug: "java-17",
          title: "Java 17",
          deep: false,
          def: "2021년 LTS 버전으로, record와 sealed 클래스가 정식 기능이 되었고 스프링 부트 3의 최소 버전이다.",
          why: "Spring Boot 3가 최소 버전으로 요구하는 LTS라서, 레코드와 sealed 클래스 같은 기능을 알아야 최신 스프링 프로젝트를 다룰 수 있기 때문이다.",
          how: [
            "- `record`: 불변 데이터 클래스. 생성자, getter, equals, hashCode, toString을 자동으로 만든다. DTO에 많이 쓴다.",
            "- `sealed` 클래스: `permits`로 상속할 수 있는 클래스를 제한한다.",
            "- 텍스트 블록(`\"\"\"`): 여러 줄 문자열을 그대로 쓴다.",
            "- `instanceof` 패턴 매칭: `if (o instanceof String s)`로 캐스팅을 생략한다.",
            "- switch 표현식: `case A -> ...` 형태로 값을 반환한다."
          ],
          use: ["요청과 응답 DTO를 record로 만들어 보일러플레이트 코드를 없앤다.", "여러 줄 SQL이나 JSON 테스트 데이터를 텍스트 블록으로 작성한다."],
          answer: "Java 17은 record, sealed 클래스, 텍스트 블록, instanceof 패턴 매칭, switch 표현식이 정식 기능이 된 LTS 버전입니다. 스프링 부트 3의 최소 지원 버전이라 실무에서 많이 쓰입니다.",
          followUps: [
            [
              "record를 JPA 엔티티로 쓸 수 있나요?",
              "쓸 수 없습니다. record는 불변이고 필드가 final이며 기본 생성자가 없어, 프록시와 변경 감지가 필요한 JPA 엔티티 요구사항에 맞지 않습니다. DTO나 값 객체에 씁니다."
            ]
          ],
          related: ["cs/java-11", "cs/java-21"]
        },
        {
          id: "cs/java-21",
          slug: "java-21",
          title: "Java 21",
          deep: false,
          def: "2023년 LTS 버전으로, 가상 스레드가 정식 기능이 되어 서버 동시성 모델에 큰 변화를 가져왔다.",
          why: "가상 스레드가 스레드 풀 크기에 묶이던 블로킹 I/O 서버의 처리량 한계를 크게 바꾸므로, 최신 LTS의 핵심 변화를 알기 위해서다.",
          how: [
            "- 가상 스레드: JVM이 관리하는 가벼운 스레드로, 블로킹 코드를 그대로 두고도 많은 동시 요청을 처리한다. 스프링 부트 3.2+에서 `spring.threads.virtual.enabled=true`로 켠다.",
            "- switch 패턴 매칭과 record 패턴: 타입과 구조로 분기하고 값을 꺼낸다.",
            "- Sequenced Collections: `getFirst()`, `getLast()`, `reversed()`.",
            "- 세대별 ZGC."
          ],
          use: ["스프링 부트 3.2+에서 spring.threads.virtual.enabled=true로 톰캣 요청 처리에 가상 스레드를 쓴다."],
          answer: "Java 21은 가상 스레드가 정식 기능이 된 LTS 버전입니다. 블로킹 코드를 그대로 쓰면서도 많은 동시 요청을 처리할 수 있게 되었습니다. switch 패턴 매칭, record 패턴, Sequenced Collections, 세대별 ZGC도 추가되었습니다.",
          followUps: [
            [
              "가상 스레드를 켜면 무조건 빨라지나요?",
              "I/O 대기가 많은 작업의 처리량이 늘어날 뿐 CPU 연산은 빨라지지 않습니다. 동시 처리 수가 늘면서 DB 커넥션 풀이 새 병목이 될 수 있어 함께 점검해야 합니다."
            ]
          ],
          related: ["cs/java-17", "cs/java-25", "cs/zgc"]
        },
        {
          id: "cs/java-25",
          slug: "java-25",
          title: "Java 25",
          deep: false,
          def: "2025년 9월 출시된 LTS 버전으로, 작성 편의 기능과 동시성 관련 API가 정식 기능이 되었다.",
          why: "Java 21 다음 LTS로 새 프로젝트의 기준 버전이 될 수 있으므로, 어떤 기능이 정식화되었는지 알아 업그레이드를 판단하기 위해서다.",
          how: [
            "- 모듈 import 선언: `import module java.base;`로 모듈의 패키지를 한 번에 가져온다.",
            "- 간결한 소스 파일과 인스턴스 main 메서드: 클래스 선언 없이 `void main()`만으로 프로그램을 작성한다.",
            "- ScopedValue: ThreadLocal보다 안전하고 가벼운 방식으로 값을 하위 호출과 가상 스레드에 전달한다.",
            "- 생성자에서 `super()` 호출 전에 검증 코드를 쓸 수 있는 유연한 생성자 본문."
          ],
          use: ["ThreadLocal 대신 ScopedValue로 요청 컨텍스트를 하위 호출과 가상 스레드에 안전하게 전달한다."],
          warn: ["운영 환경은 LTS 버전(8, 11, 17, 21, 25)을 기준으로 맞춘다. 면접에서는 8의 람다·스트림, 17의 record, 21의 가상 스레드가 가장 많이 나온다."],
          answer: "Java 25는 2025년 출시된 LTS 버전으로, 모듈 import 선언, 클래스 선언 없이 쓰는 간결한 소스 파일과 인스턴스 main 메서드, ScopedValue, 유연한 생성자 본문 등이 정식 기능이 되었습니다.",
          followUps: [
            [
              "ScopedValue는 ThreadLocal과 무엇이 다른가요?",
              "ScopedValue는 정해진 범위 안에서만 값이 유효하고 불변이며, 범위가 끝나면 자동으로 사라집니다. ThreadLocal처럼 remove를 잊어 생기는 누수가 없고 가상 스레드에서도 가볍습니다."
            ]
          ],
          related: ["cs/java-21"]
        }
      ]
    }
  ]
};

export default topic;
