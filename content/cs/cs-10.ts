import type { Topic } from '../types';

const topic: Topic = {
  key: "cs-10",
  name: "자바 동시성",
  must: [
    "`volatile`은 가시성만 보장한다. `count++` 같은 복합 연산은 `AtomicInteger`나 락으로 보호한다.",
    "`Executors.newFixedThreadPool`은 큐가 무제한이다. 운영에서는 크기가 정해진 큐와 거절 정책을 둔 `ThreadPoolExecutor`를 직접 만든다.",
    "ThreadPoolExecutor는 코어 → 큐 → 최대 스레드 → 거절 순서로 동작한다. 큐가 무제한이면 최대 스레드는 의미가 없다.",
    "`CompletableFuture`에 executor를 넘기지 않으면 공용 ForkJoinPool을 쓴다. I/O 작업은 전용 풀을 지정한다.",
    "`ConcurrentHashMap`도 확인 후 넣기는 원자적이지 않다. `computeIfAbsent`, `merge`, `putIfAbsent`를 쓴다."
  ],
  groups: [
    {
      name: "메모리 모델",
      compare: {
        cols: ["개념", "역할", "핵심 내용", "관련 도구"],
        rows: [
          ["Java Memory Model", "스레드 간 메모리 규칙", "원자성·가시성·순서성", "JLS 17장"],
          ["happens-before", "보장의 기준 관계", "A 결과가 B에서 보임", "락, volatile, start/join"],
          ["가시성 문제", "증상", "다른 스레드가 옛 값 읽음", "volatile, synchronized"],
          ["명령어 재배치", "원인", "성능 위해 실행 순서 변경", "volatile, final 필드"]
        ]
      },
      concepts: [
        {
          id: "cs/java-memory-model",
          slug: "java-memory-model",
          title: "Java Memory Model",
          deep: true,
          def: "여러 스레드가 메모리를 통해 상호작용할 때, 한 스레드가 쓴 값을 다른 스레드가 언제 어떤 순서로 볼 수 있는지 정한 자바 언어 명세(JLS 17장)의 규칙이다.",
          why: "CPU 캐시, 레지스터, 컴파일러·CPU의 명령어 재배치 때문에 한 스레드의 쓰기가 다른 스레드에 바로 보이지 않을 수 있다. JMM은 어떤 조건에서 보이는 것이 보장되는지를 정해, 하드웨어가 달라도 같은 결과를 내는 동시성 코드를 쓸 수 있게 한다.",
          how: [
            "각 스레드는 개념적으로 메인 메모리의 값을 자기 작업 메모리(CPU 캐시, 레지스터)에 복사해 쓰고, 나중에 메인 메모리에 반영한다. 반영 시점이 정해져 있지 않아 다른 스레드는 오래된 값을 볼 수 있다.",
            "JMM은 이 문제를 세 가지 성질로 나눠 다룬다.",
            "- 원자성: 연산이 중간에 끊기지 않고 한 번에 실행되는가. `count++`는 원자적이지 않다.",
            "- 가시성: 한 스레드의 쓰기가 다른 스레드에 보이는가.",
            "- 순서성: 코드에 적힌 순서대로 실행된 것처럼 보이는가. 단일 스레드에서는 결과가 같다면 재배치가 허용된다.",
            "보장은 happens-before 관계로 표현한다. A가 B보다 happens-before이면 A의 결과는 B에서 반드시 보인다.",
            "`synchronized`, `volatile`, `final` 필드, `Thread.start()`/`join()`, `java.util.concurrent` 도구들이 이 관계를 만들어 주는 수단이다."
          ],
          flow: [
            "스레드가 공유 변수 쓰기",
            "작업 메모리(캐시)에 보관",
            "동기화 도구로 경계 생성",
            "happens-before 성립",
            "메인 메모리 반영·재배치 제한",
            "다른 스레드가 최신 값 읽기"
          ],
          code: "class Worker {\n    private boolean running = true;   // volatile이 없으면 가시성 보장 없음\n\n    void stop() { running = false; }   // 스레드 A\n\n    void run() {                       // 스레드 B\n        while (running) {\n            // JIT가 running을 레지스터에 올려 두면\n            // A가 false로 바꿔도 영원히 반복할 수 있다\n        }\n    }\n}",
          codeLang: "java",
          use: [
            "종료 플래그를 volatile로 선언하지 않아 배포 후 특정 서버에서만 작업 스레드가 멈추지 않는 버그를 JMM 관점에서 원인 분석한다.",
            "공유 설정 객체를 다른 스레드에 넘길 때 volatile 참조나 불변 객체로 안전하게 공개한다."
          ],
          warn: [
            "테스트에서 한 번 잘 돌았다고 안전한 것이 아니다. 가시성 버그는 하드웨어와 JIT 최적화에 따라 가끔씩만 드러난다.",
            "JMM 규칙 밖의 \"그냥 잘 되겠지\" 코드는 다른 CPU 아키텍처(ARM 등)에서 깨질 수 있다."
          ],
          myth: [["한 번 테스트에서 잘 돌면 동시성 코드가 맞다.", "가시성 버그는 JIT 최적화와 하드웨어에 따라 가끔만 드러납니다. JMM 규칙으로 보장되는지를 따져야 합니다."]],
          answer: "JMM은 여러 스레드가 공유 변수를 읽고 쓸 때 어떤 값이 언제 보이는지 정한 자바 명세의 규칙입니다. CPU 캐시와 명령어 재배치 때문에 한 스레드의 쓰기가 다른 스레드에 바로 보이지 않을 수 있어서, happens-before 관계로 가시성과 순서를 보장하는 조건을 정의합니다. synchronized, volatile, final 같은 도구가 이 관계를 만들어 줍니다.",
          analogy: "각 스레드가 메인 메모리라는 공용 칠판을 자기 노트에 베껴 쓰는 것과 같습니다. 언제 칠판에 다시 옮겨 적고 언제 새로 베끼는지 정해 둔 규칙이 JMM입니다.",
          qa: [
            "자바 메모리 모델(JMM)이 무엇이고 왜 필요한가요?",
            "여러 스레드가 공유 변수를 읽고 쓸 때 어떤 값이 언제 보이는지 정한 규칙입니다. CPU 캐시와 명령어 재배치 때문에 한 스레드의 쓰기가 다른 스레드에 바로 보이지 않을 수 있는데, JMM은 happens-before 관계로 가시성과 순서를 보장하는 조건을 정의합니다. 그래서 synchronized나 volatile처럼 그 관계를 만드는 도구를 써야 플랫폼과 관계없이 올바른 동시성 코드가 됩니다."
          ],
          followUps: [
            [
              "JMM에서 말하는 원자성, 가시성, 순서성을 각각 설명해 주세요.",
              "원자성은 연산이 중간에 끊기지 않는 성질이고, 가시성은 한 스레드의 쓰기가 다른 스레드에 보이는 성질입니다. 순서성은 코드에 적힌 순서대로 실행된 것처럼 보이는 성질로, 재배치 때문에 깨질 수 있습니다."
            ],
            [
              "x86에서는 잘 되던 코드가 ARM에서 깨지는 이유는요?",
              "x86은 메모리 순서 규칙이 비교적 강해 재배치가 덜 드러나지만, ARM은 약한 메모리 모델이라 더 많은 재배치가 일어납니다. JMM 규칙 없이 하드웨어 특성에 기댄 코드는 플랫폼이 바뀌면 깨집니다."
            ]
          ],
          related: ["cs/happens-before", "cs/gasiseong-munje", "cs/myeongryeongeo-jaebaechi", "cs/volatile"]
        },
        {
          id: "cs/happens-before",
          slug: "happens-before",
          title: "happens-before",
          deep: true,
          def: "동작 A의 결과가 동작 B에서 반드시 보이고 A가 B보다 먼저 일어난 것처럼 보장되는 관계로, JMM이 가시성과 순서를 정의하는 기준이다.",
          why: "시간상 먼저 실행됐다는 사실만으로는 다른 스레드가 그 결과를 본다는 보장이 없다. 어떤 코드가 결과를 확실히 넘겨주는지 판단하려면 happens-before 규칙으로 따져야 한다.",
          how: [
            "대표 규칙은 다음과 같다.",
            "- 프로그램 순서 규칙: 한 스레드 안에서 앞선 동작은 뒤 동작보다 happens-before다.",
            "- 모니터 락 규칙: 어떤 락의 unlock은 같은 락의 이후 lock보다 happens-before다.",
            "- volatile 규칙: volatile 변수 쓰기는 같은 변수의 이후 읽기보다 happens-before다.",
            "- 스레드 시작 규칙: `Thread.start()` 호출은 그 스레드 안의 모든 동작보다 happens-before다.",
            "- 스레드 종료 규칙: 스레드의 모든 동작은 다른 스레드가 `join()`으로 종료를 확인한 시점보다 happens-before다.",
            "- 전이성: A → B이고 B → C이면 A → C다.",
            "전이성 덕분에 volatile 쓰기 전에 한 일반 변수 쓰기도, volatile 읽기 뒤에서는 함께 보인다. 이를 이용해 데이터를 먼저 준비하고 마지막에 volatile 플래그를 세우는 방식으로 안전하게 넘겨줄 수 있다."
          ],
          flow: ["스레드 A가 data 기록", "A가 volatile ready 기록", "B가 volatile ready 읽음", "B는 data도 최신값으로 봄"],
          code: "class Publisher {\n    private int data;               // 일반 변수\n    private volatile boolean ready; // 신호용 volatile\n\n    void write() {     // 스레드 A\n        data = 42;     // (1)\n        ready = true;  // (2) volatile 쓰기\n    }\n\n    void read() {      // 스레드 B\n        if (ready) {             // (3) volatile 읽기\n            System.out.println(data); // (4) 반드시 42\n        }\n    }\n}\n// (1) → (2) 프로그램 순서, (2) → (3) volatile 규칙, (3) → (4) 프로그램 순서\n// 전이성으로 (1) → (4)가 성립한다",
          codeLang: "java",
          use: [
            "데이터를 먼저 채우고 마지막에 volatile 플래그를 세워 다른 스레드에 초기화 완료를 알린다.",
            "`Thread.join()` 이후 작업 스레드가 쓴 결과를 동기화 없이 읽어도 안전한 이유를 설명할 때 쓴다."
          ],
          warn: [
            "happens-before는 \"실제로 먼저 실행됐다\"는 시간 개념이 아니라 \"결과가 보인다\"는 보장이다.",
            "서로 다른 락이나 서로 다른 volatile 변수 사이에는 관계가 생기지 않는다. 같은 락, 같은 변수여야 한다."
          ],
          myth: [["시간상 먼저 실행됐으면 다른 스레드도 그 결과를 본다.", "시간 순서는 가시성을 보장하지 않습니다. happens-before 관계가 있어야만 보장됩니다."]],
          answer: "happens-before는 동작 A의 결과가 동작 B에서 반드시 보인다는 JMM의 보장 관계입니다. 같은 락의 unlock은 이후 lock보다, volatile 쓰기는 이후 같은 변수 읽기보다, Thread.start는 그 스레드의 동작보다 happens-before입니다. 전이성이 있어서 volatile 플래그 앞에서 쓴 일반 변수도 플래그를 읽은 쪽에서 보입니다.",
          analogy: "택배 송장의 \"발송 완료\" 도장과 같습니다. 도장을 확인한 사람은 그 전에 상자에 넣은 물건이 모두 들어 있다고 믿을 수 있습니다.",
          qa: [
            "happens-before 관계를 예를 들어 설명해 주세요.",
            "A가 B보다 happens-before이면 A가 한 쓰기를 B가 반드시 볼 수 있다는 보장입니다. 예를 들어 같은 락의 unlock은 이후 lock보다, volatile 변수 쓰기는 이후 읽기보다 happens-before입니다. 그래서 데이터를 준비한 뒤 volatile 플래그를 세우면, 플래그를 읽은 스레드는 전이성에 의해 준비된 데이터까지 볼 수 있습니다."
          ],
          followUps: [
            [
              "서로 다른 두 락을 쓰면 happens-before가 성립하나요?",
              "아닙니다. 모니터 락 규칙은 같은 락의 unlock과 이후 lock 사이에만 성립합니다. 다른 락이나 다른 volatile 변수 사이에는 관계가 생기지 않습니다."
            ],
            [
              "ExecutorService에 작업을 제출하면 어떤 보장이 있나요?",
              "작업 제출 전의 동작은 작업 실행보다 happens-before이고, 작업의 동작은 Future.get()이 결과를 돌려준 뒤보다 happens-before입니다. 그래서 제출 전에 준비한 데이터와 작업 결과를 별도 동기화 없이 주고받을 수 있습니다."
            ]
          ],
          related: ["cs/java-memory-model", "cs/volatile", "cs/synchronized"]
        },
        {
          id: "cs/gasiseong-munje",
          slug: "gasiseong-munje",
          title: "가시성 문제",
          deep: false,
          def: "한 스레드가 공유 변수를 바꿨는데 다른 스레드가 바뀐 값을 보지 못하고 예전 값을 계속 읽는 문제다.",
          why: "한 스레드가 바꾼 값이 CPU 캐시에 머물러 다른 스레드에 보이지 않으면, 종료 플래그를 못 보고 무한 루프에 빠지는 버그가 생기기 때문이다.",
          how: [
            "원인은 CPU마다 있는 캐시와 JIT 최적화다. 스레드는 값을 캐시나 레지스터에 두고 쓰기 때문에 메인 메모리에 반영되기 전까지 다른 코어는 알 수 없다.",
            "JIT는 반복문 안에서 바뀌지 않는다고 판단한 변수를 반복문 밖으로 끌어내기도 한다(hoisting). 그러면 다른 스레드가 값을 바꿔도 반복문이 끝나지 않는다.",
            "- 해결: `volatile`로 선언하거나, 읽기와 쓰기를 같은 락의 `synchronized` 안에서 하거나, `AtomicBoolean` 같은 클래스를 쓴다.",
            "- 원자성과는 별개 문제다. 가시성이 보장되어도 `count++` 같은 복합 연산은 여전히 경쟁 상태가 생긴다."
          ],
          use: ["백그라운드 작업 루프의 `running` 플래그를 volatile로 선언해 종료 요청이 바로 반영되게 한다."],
          warn: ["디버거나 `System.out.println`을 넣으면 내부 동기화 때문에 문제가 사라져 보일 수 있다. 재현이 안 된다고 해결된 것이 아니다."],
          myth: [["println을 넣으니 문제가 사라졌으니 해결됐다.", "println 내부의 동기화가 우연히 가시성을 만든 것일 뿐입니다. 코드에서 명시적으로 보장해야 합니다."]],
          answer: "가시성 문제는 한 스레드가 공유 변수를 바꿨는데 다른 스레드가 CPU 캐시나 레지스터의 옛 값을 계속 읽는 문제입니다. JIT가 반복문 안의 변수 읽기를 밖으로 빼는 최적화도 원인입니다. volatile, synchronized, Atomic 클래스로 해결하며, 원자성과는 별개의 문제입니다.",
          followUps: [
            [
              "가시성만 보장되면 count++도 안전한가요?",
              "아닙니다. count++는 읽기, 더하기, 쓰기 세 단계라 두 스레드가 같은 값을 읽고 각각 더해 증가가 유실됩니다. 원자성은 AtomicInteger나 락으로 따로 보장해야 합니다."
            ]
          ],
          related: ["cs/java-memory-model", "cs/volatile", "cs/gyeongjaeng-sangtae"]
        },
        {
          id: "cs/myeongryeongeo-jaebaechi",
          slug: "myeongryeongeo-jaebaechi",
          title: "명령어 재배치",
          deep: false,
          def: "컴파일러, JIT, CPU가 성능을 위해 단일 스레드 결과가 같다는 전제에서 명령어 실행 순서를 바꾸는 최적화다.",
          why: "컴파일러와 CPU가 성능을 위해 명령 순서를 바꾸면, 다른 스레드가 초기화가 덜 된 객체를 보는 버그가 생길 수 있기 때문이다.",
          how: [
            "단일 스레드에서는 결과가 같으므로 문제가 없지만, 다른 스레드는 바뀐 순서를 관찰할 수 있다.",
            "대표 사례는 volatile 없는 더블 체크 락킹 싱글톤이다. `instance = new Singleton()`은 메모리 할당 → 생성자 실행 → 참조 대입 순서지만, 생성자 실행과 참조 대입이 바뀌면 다른 스레드가 초기화가 덜 된 객체를 받을 수 있다.",
            "- `volatile` 쓰기·읽기 앞뒤로는 재배치가 제한된다(메모리 배리어).",
            "- `synchronized` 블록 안팎으로 넘나드는 재배치도 제한된다.",
            "- 생성자에서 대입된 `final` 필드는 객체 참조가 공개된 뒤 다른 스레드에서 초기화된 값으로 보이도록 보장된다."
          ],
          code: "class Singleton {\n    private static volatile Singleton instance; // volatile 필수\n\n    static Singleton getInstance() {\n        if (instance == null) {\n            synchronized (Singleton.class) {\n                if (instance == null) {\n                    instance = new Singleton();\n                }\n            }\n        }\n        return instance;\n    }\n}",
          codeLang: "java",
          use: ["더블 체크 락킹 싱글톤의 인스턴스 필드에 volatile을 붙여 반쯤 생성된 객체가 노출되는 것을 막는다."],
          warn: ["싱글톤이 필요하면 더블 체크 락킹보다 홀더 클래스 방식이나 enum 싱글톤이 더 간단하고 안전하다."],
          answer: "명령어 재배치는 컴파일러, JIT, CPU가 단일 스레드 결과가 같다는 전제로 실행 순서를 바꾸는 최적화입니다. 다른 스레드는 바뀐 순서를 관찰할 수 있어서, 대표적으로 volatile 없는 더블 체크 락킹에서 초기화가 덜 된 객체가 공개될 수 있습니다. volatile, synchronized, final 필드 규칙이 재배치를 제한합니다.",
          analogy: "요리사가 결과만 같으면 재료 손질 순서를 바꾸는 것과 같습니다. 혼자 요리할 땐 문제없지만 옆에서 중간 과정을 보는 사람은 덜 된 요리를 보게 됩니다.",
          followUps: [
            [
              "더블 체크 락킹에서 volatile이 왜 필요한가요?",
              "객체 생성은 메모리 할당, 생성자 실행, 참조 대입 순서인데 생성자 실행과 참조 대입이 바뀌면 다른 스레드가 초기화 전 객체를 받을 수 있습니다. volatile이 그 재배치를 막아 줍니다. 더 간단한 대안은 홀더 클래스 방식이나 enum 싱글톤입니다."
            ]
          ],
          related: ["cs/java-memory-model", "cs/volatile", "cs/singgeulton-paeteon"]
        }
      ]
    },
    {
      name: "락과 원자 연산",
      compare: {
        cols: ["기준", "volatile", "synchronized", "ReentrantLock", "Atomic 클래스"],
        rows: [
          ["가시성", "보장", "보장", "보장", "보장"],
          ["원자성", "단일 읽기·쓰기만", "블록 전체", "블록 전체", "단일 변수 연산"],
          ["대기 방식", "대기 없음", "BLOCKED, 중단 불가", "타임아웃·인터럽트 가능", "CAS 재시도"],
          ["적합한 곳", "상태 플래그", "일반적인 임계 구역", "타임아웃·공정성 필요", "카운터, 단일 값 갱신"]
        ]
      },
      concepts: [
        {
          id: "cs/volatile",
          slug: "volatile",
          title: "volatile",
          deep: true,
          def: "변수의 읽기와 쓰기를 항상 메인 메모리 기준으로 보이게 하고 앞뒤 재배치를 막아, 가시성과 순서를 보장하는 키워드다.",
          why: "스레드 사이에 상태 플래그나 한 번 설정되는 참조를 넘길 때, 락 없이 가볍게 가시성을 보장할 수 있다.",
          how: [
            "- 가시성: volatile 쓰기는 이후 같은 변수를 읽는 모든 스레드에게 보인다.",
            "- 순서: volatile 쓰기 이전의 쓰기는 그 뒤로 재배치되지 않고, volatile 읽기 이후의 읽기는 그 앞으로 재배치되지 않는다.",
            "- 원자성: 64비트 `long`, `double`의 읽기·쓰기도 원자적으로 만든다. 하지만 읽고-계산하고-쓰는 복합 연산은 원자적이지 않다.",
            "적합한 경우는 다음과 같다.",
            "1) 한 스레드만 쓰고 여러 스레드가 읽는 상태 플래그(`running`, `shutdownRequested`).",
            "2) 초기화를 마친 객체 참조를 안전하게 공개할 때(더블 체크 락킹).",
            "3) 값을 통째로 바꿔 끼우는 설정 객체 참조.",
            "여러 스레드가 동시에 값을 갱신해야 하면 `synchronized`나 Atomic 클래스를 써야 한다."
          ],
          flow: ["스레드 A가 일반 변수 쓰기", "volatile 변수 쓰기", "이전 쓰기와 함께 메모리 반영", "스레드 B가 volatile 읽기", "이후 읽기는 최신 값 보장"],
          code: "class Counter {\n    private volatile int count = 0;\n\n    void increment() {\n        count++;   // 위험: 읽기-더하기-쓰기 사이에 다른 스레드가 끼어든다\n    }\n}\n\nclass SafeCounter {\n    private final AtomicInteger count = new AtomicInteger();\n\n    void increment() {\n        count.incrementAndGet(); // CAS로 원자적 증가\n    }\n}",
          codeLang: "java",
          use: [
            "스케줄러의 종료 요청 플래그 `volatile boolean shutdown`에 쓴다.",
            "설정을 다시 불러올 때 새 설정 객체를 만들어 volatile 참조를 통째로 바꿔 끼운다."
          ],
          warn: [
            "`volatile int count`에 `count++`를 해도 증가가 유실된다. 가장 흔한 면접 함정이다.",
            "volatile은 락이 아니므로 \"확인 후 실행(check-then-act)\" 같은 여러 단계의 연산을 보호하지 못한다."
          ],
          myth: [["volatile을 붙이면 스레드 안전하다.", "가시성과 순서만 보장합니다. 확인 후 실행, 읽고-고쳐-쓰기 같은 복합 연산은 여전히 경쟁 상태가 생깁니다."]],
          answer: "volatile은 변수의 읽기와 쓰기가 항상 다른 스레드에 보이도록 하고 앞뒤 재배치를 막는 키워드입니다. 다만 원자성은 보장하지 않아 count++ 같은 복합 연산은 안전하지 않습니다. 그래서 한 스레드가 쓰고 여러 스레드가 읽는 상태 플래그나 초기화된 참조 공개에 씁니다.",
          analogy: "게시판 공지에 \"항상 원본을 확인하시오\" 딱지를 붙이는 것과 같습니다. 원본을 보게는 해 주지만 두 사람이 동시에 고쳐 쓰는 것까지 막지는 못합니다.",
          qa: [
            "volatile은 언제 쓰고, synchronized와 무엇이 다른가요?",
            "volatile은 변수의 가시성과 재배치 방지를 보장하지만 원자성은 보장하지 않습니다. 그래서 한 스레드가 쓰고 여러 스레드가 읽는 상태 플래그나 참조 공개에 적합합니다. synchronized는 상호 배제로 원자성과 가시성을 모두 보장하므로 count++ 같은 복합 연산이나 여러 변수를 함께 바꿔야 할 때 씁니다."
          ],
          followUps: [
            [
              "volatile과 synchronized를 함께 쓰는 경우는 언제인가요?",
              "더블 체크 락킹처럼 생성은 synchronized로 한 번만 하고, 이후 읽기는 락 없이 빠르게 하되 안전한 공개를 위해 volatile을 씁니다. 쓰기 경합이 적고 읽기가 많은 경우의 최적화입니다."
            ],
            [
              "volatile long이 필요한 이유가 있나요?",
              "64비트 long과 double의 일반 쓰기는 32비트씩 두 번 나뉘어 반쯤 쓴 값이 보일 수 있다고 명세에 허용되어 있습니다. volatile을 붙이면 읽기와 쓰기가 원자적으로 보장됩니다."
            ]
          ],
          related: ["cs/gasiseong-munje", "cs/happens-before", "cs/synchronized", "cs/atomic-keulraeseu"]
        },
        {
          id: "cs/synchronized",
          slug: "synchronized",
          title: "synchronized",
          deep: true,
          def: "객체마다 있는 모니터 락을 잡아 한 번에 한 스레드만 블록이나 메서드를 실행하게 하는 자바의 기본 동기화 키워드다.",
          why: "공유 상태를 여러 단계로 읽고 바꾸는 코드를 한 스레드씩 실행되게 해 경쟁 상태를 막고, 동시에 락 해제 시점의 변경이 다음 락 획득 스레드에 보이게 한다.",
          how: [
            "- 인스턴스 메서드에 붙이면 `this` 객체의 락을, static 메서드에 붙이면 `Class` 객체의 락을 잡는다.",
            "- `synchronized (lock) { ... }` 블록으로 필요한 구간만 좁게 잠그고 락 객체를 직접 지정할 수 있다.",
            "- 재진입 가능: 이미 락을 가진 스레드가 같은 락이 필요한 다른 메서드를 호출해도 막히지 않는다.",
            "- 예외가 나도 블록을 벗어나면 락이 자동으로 풀린다.",
            "- 락을 기다리는 스레드는 BLOCKED 상태가 되며, 기다림을 중단(interrupt)하거나 타임아웃을 줄 수 없다.",
            "- `wait()`/`notify()`/`notifyAll()`로 조건이 만족될 때까지 기다리고 깨울 수 있다. 반드시 같은 객체의 락을 잡은 상태에서 호출해야 한다.",
            "JVM은 경합이 없으면 가벼운 락, 경합이 생기면 무거운 OS 수준 락으로 바꾸는 최적화를 한다. Java 21 가상 스레드에서 synchronized 안의 블로킹은 캐리어 스레드를 묶는(pinning) 문제가 있었고 JDK 24에서 대부분 해결되었다."
          ],
          flow: ["스레드가 모니터 락 요청", "비어 있으면 획득 후 진입", "사용 중이면 BLOCKED 대기", "블록 종료 시 락 해제", "대기 스레드 하나가 획득"],
          code: "class BankAccount {\n    private long balance;\n    private final Object lock = new Object();\n\n    void withdraw(long amount) {\n        synchronized (lock) {           // 확인과 차감을 하나로 묶는다\n            if (balance < amount) {\n                throw new IllegalStateException(\"잔액 부족\");\n            }\n            balance -= amount;\n        }\n    }\n}",
          codeLang: "java",
          use: ["계좌 잔액 확인과 차감을 하나의 synchronized 블록으로 묶어 음수 잔액을 막는다.", "로컬 캐시를 처음 채울 때 한 스레드만 DB를 조회하도록 감싼다."],
          warn: [
            "락 범위가 넓으면 처리량이 떨어진다. 외부 API 호출이나 I/O를 락 안에 두지 않는다.",
            "`String` 리터럴이나 박싱된 `Integer`를 락 객체로 쓰면 다른 코드와 우연히 같은 락을 공유할 수 있다. 전용 `private final Object`를 쓴다.",
            "서버가 여러 대면 synchronized는 각 JVM 안에서만 유효하다. 분산 환경의 동시성은 DB 락이나 분산 락이 필요하다."
          ],
          myth: [
            [
              "synchronized를 쓰면 여러 서버에서도 중복 처리가 막힌다.",
              "JVM 하나 안에서만 유효합니다. 서버가 여러 대면 DB 락이나 Redis 분산 락이 필요합니다."
            ]
          ],
          answer: "synchronized는 객체의 모니터 락을 잡아 한 번에 한 스레드만 블록을 실행하게 하는 키워드입니다. 상호 배제로 원자성을 보장하고, 락 해제가 다음 획득보다 happens-before라 가시성도 보장합니다. 재진입이 가능하고 예외가 나도 자동 해제되지만, 대기 중 타임아웃이나 인터럽트가 안 되고 JVM 하나 안에서만 유효합니다.",
          analogy: "화장실 열쇠가 하나뿐인 것과 같습니다. 열쇠를 가진 사람만 들어가고, 나오면서 열쇠를 반납해야 다음 사람이 들어갑니다.",
          qa: [
            "synchronized의 동작 원리와 한계를 설명해 주세요.",
            "synchronized는 객체의 모니터 락을 획득한 스레드만 블록에 들어가게 해 원자성을 보장하고, 락 해제가 다음 획득보다 happens-before라서 가시성도 보장합니다. 재진입이 가능하고 예외가 나도 자동으로 해제됩니다. 다만 대기 중 인터럽트나 타임아웃이 안 되고 공정성을 고를 수 없으며, JVM 하나 안에서만 동작한다는 한계가 있어 필요하면 ReentrantLock이나 분산 락을 씁니다."
          ],
          followUps: [
            [
              "synchronized 메서드와 synchronized 블록의 차이는?",
              "메서드에 붙이면 this(또는 Class 객체) 전체가 락 범위가 되고, 블록은 필요한 구간만 원하는 락 객체로 좁게 잠글 수 있습니다. 락 범위를 좁힐수록 경합이 줄어 처리량이 좋아집니다."
            ],
            [
              "wait()과 sleep()의 차이는?",
              "wait()은 락을 잡은 상태에서만 호출할 수 있고 락을 내려놓고 기다리며, notify로 깨어난 뒤 락을 다시 얻습니다. sleep()은 락을 쥔 채로 그냥 시간만 멈춥니다."
            ],
            [
              "가상 스레드에서 synchronized를 쓰면 문제가 있나요?",
              "JDK 21~23에서는 synchronized 안에서 블로킹하면 가상 스레드가 캐리어 스레드에 고정되는 pinning 문제가 있어 ReentrantLock을 권장했습니다. JDK 24에서 대부분 해결되었습니다."
            ]
          ],
          related: ["cs/moniteo", "cs/reentrantlock", "cs/happens-before", "cs/gyeongjaeng-sangtae"]
        },
        {
          id: "cs/reentrantlock",
          slug: "reentrantlock",
          title: "ReentrantLock",
          deep: false,
          def: "`java.util.concurrent.locks`의 명시적 락으로, synchronized보다 세밀한 제어(타임아웃, 인터럽트, 공정성, 여러 조건)를 제공한다.",
          why: "`synchronized`로는 할 수 없는 타임아웃 대기, 인터럽트 가능한 대기, 공정성 설정, 여러 조건 변수가 필요할 때 쓰기 위해서다.",
          how: [
            "- `tryLock(timeout)`: 정해진 시간 안에 락을 못 얻으면 포기해 데드락을 피할 수 있다.",
            "- `lockInterruptibly()`: 락을 기다리는 중에 인터럽트로 빠져나올 수 있다.",
            "- 공정성: `new ReentrantLock(true)`면 오래 기다린 스레드부터 락을 얻는다. 처리량은 떨어진다.",
            "- `newCondition()`: 하나의 락에 여러 대기 조건(예: notFull, notEmpty)을 둘 수 있다.",
            "- synchronized처럼 재진입이 가능하고 happens-before도 보장한다.",
            "반드시 `try { ... } finally { lock.unlock(); }` 형태로 써야 한다. 해제를 빠뜨리면 영원히 락이 잡힌 상태가 된다."
          ],
          code: "private final ReentrantLock lock = new ReentrantLock();\n\nboolean transfer() throws InterruptedException {\n    if (!lock.tryLock(1, TimeUnit.SECONDS)) {\n        return false;            // 1초 안에 못 잡으면 포기\n    }\n    try {\n        // 임계 구역\n        return true;\n    } finally {\n        lock.unlock();\n    }\n}",
          codeLang: "java",
          use: [
            "락을 1초 안에 못 얻으면 \"잠시 후 다시 시도해 주세요\"로 응답해 요청 스레드가 무한 대기하지 않게 한다.",
            "생산자-소비자 버퍼에 notFull, notEmpty 두 Condition을 둔다."
          ],
          warn: ["특별한 기능이 필요 없으면 synchronized가 더 간단하고 실수가 적다."],
          answer: "ReentrantLock은 synchronized처럼 재진입 가능한 상호 배제 락이지만, tryLock 타임아웃, 대기 중 인터럽트, 공정성 옵션, 여러 Condition을 제공합니다. 대신 unlock을 finally에서 직접 호출해야 해 실수 위험이 있습니다. 특별한 기능이 필요할 때만 쓰고 기본은 synchronized를 씁니다.",
          followUps: [
            [
              "공정 락을 기본으로 쓰지 않는 이유는?",
              "공정 락은 오래 기다린 순서대로 락을 넘기느라 스레드 전환이 늘어 처리량이 크게 떨어집니다. 기아가 실제로 문제될 때만 씁니다."
            ]
          ],
          related: ["cs/synchronized", "cs/readwritelock", "cs/dedeurak"]
        },
        {
          id: "cs/readwritelock",
          slug: "readwritelock",
          title: "ReadWriteLock",
          deep: false,
          def: "읽기 락은 여러 스레드가 동시에, 쓰기 락은 한 스레드만 잡을 수 있게 나눠 읽기가 많은 상황의 처리량을 높이는 락이다.",
          why: "읽기가 대부분인 데이터에서 읽기끼리도 서로 막으면 동시성이 크게 떨어지므로, 읽기는 동시에 허용하고 쓰기만 배타적으로 막기 위해서다.",
          how: [
            "`ReentrantReadWriteLock`이 대표 구현이다. 쓰기 락을 가진 동안에는 읽기도 막히고, 읽기 락이 하나라도 있으면 쓰기는 기다린다.",
            "- 적합: 설정값, 캐시처럼 읽기가 쓰기보다 훨씬 많은 데이터.",
            "- 부적합: 쓰기가 잦거나 임계 구역이 매우 짧은 경우. 락 관리 비용이 더 크다.",
            "`StampedLock`은 락 없이 읽어 본 뒤 그사이 쓰기가 있었는지 확인하는 낙관적 읽기를 제공해 더 빠르지만, 재진입이 안 되고 사용이 까다롭다."
          ],
          use: ["자주 조회되고 가끔 갱신되는 국가 코드 같은 참조 데이터 캐시를 보호한다."],
          warn: ["읽기 락을 쥔 채 쓰기 락으로 올리려고 하면 데드락이 난다(락 업그레이드 불가)."],
          answer: "ReadWriteLock은 읽기 락은 여러 스레드가 동시에, 쓰기 락은 하나만 잡게 해 읽기가 많은 데이터의 처리량을 높입니다. 쓰기 중에는 읽기도 막힙니다. 쓰기가 잦거나 임계 구역이 짧으면 오히려 일반 락보다 느릴 수 있습니다.",
          followUps: [
            [
              "읽기 락을 쥔 채 쓰기 락을 얻을 수 있나요?",
              "ReentrantReadWriteLock은 락 업그레이드를 지원하지 않아 읽기 락을 쥔 채 쓰기 락을 요청하면 데드락이 납니다. 읽기 락을 먼저 풀고 쓰기 락을 얻은 뒤 상태를 다시 확인해야 합니다."
            ]
          ],
          related: ["cs/reentrantlock", "cs/copyonwritearraylist"]
        },
        {
          id: "cs/atomic-keulraeseu",
          slug: "atomic-keulraeseu",
          title: "Atomic 클래스",
          deep: false,
          def: "`AtomicInteger`, `AtomicLong`, `AtomicReference`처럼 CAS 연산으로 락 없이 단일 변수를 원자적으로 갱신하는 클래스들이다.",
          why: "카운터 증가처럼 단순한 연산에 락을 걸면 비용이 크므로, CAS로 락 없이 원자적으로 갱신하기 위해서다.",
          how: [
            "`incrementAndGet()`은 현재 값을 읽고, 기대값이 그대로일 때만 새 값으로 바꾸는 CAS를 성공할 때까지 반복한다. 스레드를 재우지 않아 경합이 적을 때 락보다 빠르다.",
            "- `compareAndSet(expect, update)`, `updateAndGet(fn)`, `accumulateAndGet(x, fn)`으로 복잡한 갱신도 원자적으로 할 수 있다.",
            "- 경합이 매우 심한 카운터는 `LongAdder`가 낫다. 내부적으로 여러 셀에 나눠 더하고 합계를 낼 때 모은다.",
            "- ABA 문제: 값이 A → B → A로 바뀌면 CAS는 변화를 눈치채지 못한다. 버전을 함께 비교하는 `AtomicStampedReference`로 해결한다.",
            "하나의 변수만 원자적으로 다룰 수 있다. 여러 변수를 함께 일관되게 바꿔야 하면 락이 필요하다."
          ],
          code: "AtomicLong total = new AtomicLong();\ntotal.addAndGet(500);\n\nLongAdder hits = new LongAdder(); // 경합이 심한 조회수 카운터\nhits.increment();\nlong sum = hits.sum();",
          codeLang: "java",
          use: [
            "API 호출 횟수, 처리 건수 같은 메트릭 카운터를 AtomicLong이나 LongAdder로 센다.",
            "주문 번호 생성기를 AtomicLong으로 만들어 서버 안에서 중복 없이 증가시킨다."
          ],
          myth: [
            [
              "락이 없으니 항상 synchronized보다 빠르다.",
              "경합이 심하면 CAS 실패와 재시도가 반복되어 CPU를 낭비합니다. 이럴 때는 LongAdder나 락이 낫습니다."
            ]
          ],
          answer: "Atomic 클래스는 CAS 연산으로 락 없이 단일 변수를 원자적으로 갱신하는 클래스입니다. incrementAndGet은 기대값이 그대로일 때만 바꾸는 CAS를 성공할 때까지 반복합니다. 경합이 매우 심한 카운터는 LongAdder가 더 빠르고, 여러 변수를 함께 바꿔야 하면 락이 필요합니다.",
          followUps: [
            [
              "ABA 문제란 무엇이고 어떻게 해결하나요?",
              "값이 A에서 B로 갔다가 다시 A가 되면 CAS는 변화가 없었다고 판단합니다. 버전 번호를 함께 비교하는 AtomicStampedReference로 해결합니다."
            ]
          ],
          related: ["cs/cas", "cs/volatile", "cs/concurrenthashmap"]
        }
      ]
    },
    {
      name: "스레드 풀",
      compare: {
        cols: ["개념", "역할", "핵심 내용"],
        rows: [
          ["ExecutorService", "작업 실행 인터페이스", "`submit`, `shutdown`, `Future` 반환"],
          ["ThreadPoolExecutor 파라미터", "풀 구현체 설정", "코어→큐→최대 스레드→거절 순"],
          ["거절 정책", "포화 시 처리", "Abort, CallerRuns, Discard 등"],
          ["스레드 풀 크기 산정", "적정 스레드 수", "CPU 작업 ≈ 코어 수, I/O 작업은 더 많이"],
          ["Executors 팩토리 함정", "운영 위험", "무제한 큐/스레드로 OOM"]
        ]
      },
      concepts: [
        {
          id: "cs/executorservice",
          slug: "executorservice",
          title: "ExecutorService",
          deep: true,
          def: "작업(Runnable, Callable)을 제출하면 내부 스레드 풀이 실행해 주는 자바의 표준 작업 실행 프레임워크다.",
          why: "요청마다 `new Thread()`를 만들면 생성 비용이 크고 스레드 수가 무제한으로 늘어 메모리와 컨텍스트 스위칭 비용으로 서버가 무너진다. 스레드를 재사용하고 개수를 제한하려고 쓴다.",
          how: [
            "작업 제출과 실행을 분리한 것이 핵심이다. 호출하는 쪽은 \"무엇을 할지\"만 넘기고, 언제 어느 스레드에서 실행할지는 실행기가 정한다.",
            "- `execute(Runnable)`: 결과 없이 실행한다. 예외는 스레드의 UncaughtExceptionHandler로 간다.",
            "- `submit(Callable)`: `Future`를 돌려준다. 예외는 `Future.get()`을 호출할 때 `ExecutionException`으로 감싸져 나온다.",
            "- `invokeAll`, `invokeAny`: 여러 작업을 한꺼번에 제출한다.",
            "종료 절차:",
            "1) `shutdown()`: 새 작업을 받지 않고, 이미 받은 작업은 끝까지 실행한다.",
            "2) `awaitTermination(timeout)`: 정해진 시간 동안 종료를 기다린다.",
            "3) `shutdownNow()`: 실행 중인 작업에 인터럽트를 보내고, 대기 중인 작업 목록을 돌려준다.",
            "Java 19부터 ExecutorService는 AutoCloseable이라 try-with-resources로 쓰면 블록이 끝날 때 모든 작업 완료를 기다리고 닫힌다."
          ],
          flow: ["submit으로 작업 제출", "풀의 스레드가 작업 실행", "Future에 결과·예외 저장", "shutdown으로 신규 차단", "awaitTermination 대기"],
          code: "try (ExecutorService pool = Executors.newFixedThreadPool(4)) {\n    Future<Integer> f = pool.submit(() -> heavyCalc());\n    pool.execute(() -> sendEmail());\n    System.out.println(f.get(2, TimeUnit.SECONDS));\n} // close(): 남은 작업을 기다린 뒤 종료\n\n// Java 21: 작업마다 가상 스레드 하나\ntry (var vt = Executors.newVirtualThreadPerTaskExecutor()) {\n    urls.forEach(u -> vt.submit(() -> fetch(u)));\n}",
          codeLang: "java",
          use: [
            "외부 API 여러 개를 동시에 호출하는 작업을 전용 고정 크기 풀에서 실행한다.",
            "애플리케이션 종료 시 @PreDestroy에서 풀을 shutdown해 처리 중인 작업을 마무리한다."
          ],
          warn: [
            "스레드 풀을 종료하지 않으면 비데몬 스레드가 남아 JVM이 끝나지 않는다.",
            "`submit()`으로 제출하고 `Future`를 확인하지 않으면 작업 안의 예외가 조용히 사라진다.",
            "요청마다 새 스레드 풀을 만들지 않는다. 풀은 애플리케이션 단위로 만들어 재사용한다(스프링에서는 빈으로 등록)."
          ],
          answer: "ExecutorService는 작업을 제출하면 스레드 풀이 실행해 주는 자바 표준 실행 프레임워크입니다. 스레드를 재사용하고 개수를 제한해 생성 비용과 스레드 폭증을 막고, Future로 결과와 예외를 받습니다. 사용 후에는 shutdown과 awaitTermination으로 안전하게 종료해야 합니다.",
          analogy: "택배 회사의 배송 기사 팀과 같습니다. 주문할 때마다 기사를 새로 뽑지 않고, 정해진 기사들이 대기열의 택배를 차례로 맡아 배송합니다.",
          qa: [
            "스레드를 직접 만들지 않고 ExecutorService를 쓰는 이유는?",
            "스레드 생성은 비용이 크고, 요청마다 만들면 스레드 수가 제한 없이 늘어 메모리와 컨텍스트 스위칭 비용으로 시스템이 무너집니다. ExecutorService는 정해진 수의 스레드를 재사용하고 작업 큐로 부하를 흡수하며, 작업 제출과 실행 정책을 분리해 줍니다. 또 Future로 결과와 예외를 받고, shutdown으로 안전하게 종료할 수 있습니다."
          ],
          followUps: [
            [
              "execute와 submit의 차이는?",
              "execute는 결과 없이 실행하고 예외가 스레드의 예외 핸들러로 전달됩니다. submit은 Future를 돌려주고 예외가 Future 안에 저장되어 get()을 호출해야 드러납니다. 그래서 submit 후 Future를 확인하지 않으면 예외가 조용히 사라집니다."
            ],
            [
              "shutdown과 shutdownNow의 차이는?",
              "shutdown은 새 작업만 막고 이미 받은 작업은 끝까지 실행합니다. shutdownNow는 실행 중 작업에 인터럽트를 보내고 대기 중 작업 목록을 돌려주며, 작업이 인터럽트에 반응하도록 짜여 있어야 실제로 멈춥니다."
            ]
          ],
          related: ["cs/threadpoolexecutor-paramiteo", "cs/future", "cs/seuredeu-pul-keugi-sanjeong", "cs/java-21"]
        },
        {
          id: "cs/threadpoolexecutor-paramiteo",
          slug: "threadpoolexecutor-paramiteo",
          title: "ThreadPoolExecutor 파라미터",
          deep: true,
          def: "스레드 풀의 실제 구현체로, 코어 스레드 수, 최대 스레드 수, 작업 큐, 유휴 시간, 거절 정책으로 동작 방식이 결정된다.",
          why: "풀이 언제 스레드를 늘리고 언제 작업을 거절하는지 정확히 알아야 트래픽 폭주 때 메모리 부족이나 요청 유실을 막을 수 있다. 면접에서 \"작업이 들어오면 어떤 순서로 처리되나\"를 자주 묻는다.",
          how: [
            "생성자 파라미터는 corePoolSize, maximumPoolSize, keepAliveTime, workQueue, threadFactory, handler(거절 정책)다.",
            "작업이 들어올 때 처리 순서:",
            "1) 실행 중인 스레드가 corePoolSize보다 적으면 새 스레드를 만들어 바로 실행한다.",
            "2) 코어가 모두 바쁘면 작업을 workQueue에 넣는다.",
            "3) 큐까지 가득 차면 maximumPoolSize까지 스레드를 추가로 만든다.",
            "4) 최대 스레드까지 모두 바쁘고 큐도 가득 차면 거절 정책을 실행한다.",
            "코어보다 많은 스레드는 keepAliveTime 동안 일이 없으면 종료된다.",
            "중요한 함정: 큐가 무제한(`LinkedBlockingQueue` 기본 생성)이면 3단계에 영원히 도달하지 않아 maximumPoolSize는 의미가 없고, 대신 큐에 작업이 끝없이 쌓여 메모리가 부족해진다.",
            "threadFactory로 스레드 이름(`order-worker-1`)을 지정해 두면 스레드 덤프와 로그 분석이 쉬워진다."
          ],
          flow: ["코어 미만이면 새 스레드", "코어가 차면 큐에 적재", "큐가 차면 최대까지 증설", "최대·큐 모두 차면 거절", "유휴 초과 스레드 종료"],
          code: "ThreadPoolExecutor pool = new ThreadPoolExecutor(\n    8,                                   // corePoolSize\n    16,                                  // maximumPoolSize\n    60, TimeUnit.SECONDS,                // 초과 스레드 유휴 시간\n    new ArrayBlockingQueue<>(500),       // 크기가 정해진 큐\n    Thread.ofPlatform().name(\"order-\", 0).factory(),\n    new ThreadPoolExecutor.CallerRunsPolicy() // 넘치면 호출 스레드가 실행\n);",
          codeLang: "java",
          use: [
            "주문 알림 발송 풀을 코어 8, 최대 16, 크기 500 큐, CallerRunsPolicy로 만들어 폭주 시 자연스럽게 속도를 늦춘다.",
            "큐 길이와 활성 스레드 수를 Micrometer 메트릭으로 내보내 대시보드에서 감시한다."
          ],
          warn: [
            "\"코어가 차면 최대까지 스레드를 늘린다\"고 답하는 것이 흔한 오답이다. 큐가 먼저 찬다.",
            "운영 환경에서는 크기가 정해진 큐와 명시적인 거절 정책을 쓰고, 큐 길이와 활성 스레드 수를 메트릭으로 감시한다."
          ],
          myth: [["코어 스레드가 다 바쁘면 최대 스레드 수까지 바로 늘어난다.", "큐가 먼저 찹니다. 큐가 가득 찬 뒤에야 최대 스레드까지 늘어납니다."]],
          answer: "ThreadPoolExecutor는 코어 스레드, 작업 큐, 최대 스레드, 거절 정책 순서로 동작합니다. 코어가 다 바쁘면 먼저 큐에 쌓고, 큐가 가득 차야 최대 스레드까지 늘리며, 그래도 넘치면 거절 정책을 실행합니다. 그래서 무제한 큐를 쓰면 최대 스레드 설정이 무의미해지고 메모리 부족 위험이 생깁니다.",
          analogy: "식당 운영과 같습니다. 정직원(코어)이 다 바쁘면 손님을 대기석(큐)에 앉히고, 대기석까지 차면 아르바이트(최대 스레드)를 부르며, 그래도 넘치면 손님을 돌려보냅니다(거절).",
          qa: [
            "ThreadPoolExecutor에 작업이 들어오면 어떤 순서로 처리되나요?",
            "먼저 코어 스레드 수보다 적게 돌고 있으면 새 스레드를 만들어 실행합니다. 코어가 모두 바쁘면 작업 큐에 넣고, 큐가 가득 찼을 때 비로소 최대 스레드 수까지 스레드를 늘립니다. 그래도 넘치면 거절 정책이 실행됩니다. 그래서 무제한 큐를 쓰면 최대 스레드 설정이 무의미해지고 메모리 부족 위험이 생깁니다."
          ],
          followUps: [
            [
              "스프링의 ThreadPoolTaskExecutor 기본 설정에는 어떤 문제가 있나요?",
              "스프링 부트가 자동 설정하는 실행기는 코어 8개에 큐 용량이 무제한이라 최대 스레드 설정이 사실상 쓰이지 않고 작업이 메모리에 계속 쌓일 수 있습니다. 운영에서는 큐 용량과 거절 정책을 명시합니다."
            ],
            [
              "SynchronousQueue를 작업 큐로 쓰면 어떻게 동작하나요?",
              "저장 공간이 없어 받을 스레드가 없으면 바로 큐가 찬 것으로 취급되어 최대 스레드까지 즉시 늘어납니다. newCachedThreadPool이 이 방식이라 스레드가 폭증할 수 있습니다."
            ]
          ],
          related: ["cs/executorservice", "cs/geojeol-jeongchaek", "cs/executors-paektori-hamjeong", "cs/blockingqueue"]
        },
        {
          id: "cs/geojeol-jeongchaek",
          slug: "geojeol-jeongchaek",
          title: "거절 정책",
          deep: false,
          def: "스레드 풀의 최대 스레드와 큐가 모두 가득 찼을 때 새 작업을 어떻게 처리할지 정하는 `RejectedExecutionHandler`다.",
          why: "스레드와 큐가 모두 찬 상태에서 들어온 작업을 어떻게 처리할지 정하지 않으면, 작업이 예외로 버려지거나 시스템이 과부하에 빠지기 때문이다.",
          how: [
            "- AbortPolicy(기본): `RejectedExecutionException`을 던진다. 호출자가 실패를 알 수 있다.",
            "- CallerRunsPolicy: 작업을 제출한 스레드가 직접 실행한다. 제출 속도가 자연스럽게 느려져 백프레셔 효과가 있다. 다만 톰캣 요청 스레드가 실행하게 되면 응답이 느려진다.",
            "- DiscardPolicy: 아무 말 없이 버린다. 유실돼도 괜찮은 작업에만 쓴다.",
            "- DiscardOldestPolicy: 큐에서 가장 오래된 작업을 버리고 새 작업을 넣는다.",
            "직접 구현해 거절된 작업을 로그로 남기거나, 메시지 큐에 넣어 나중에 처리하게 할 수도 있다."
          ],
          use: ["로그 전송 풀은 DiscardOldestPolicy로 오래된 로그를 버리고, 결제 후처리 풀은 AbortPolicy로 실패를 감지해 재처리 큐에 넣는다."],
          warn: ["Discard 계열은 장애가 조용히 묻힌다. 쓰더라도 거절 횟수를 메트릭으로 남긴다."],
          answer: "거절 정책은 스레드 풀의 최대 스레드와 큐가 모두 찼을 때 새 작업을 어떻게 할지 정하는 설정입니다. 기본 AbortPolicy는 예외를 던지고, CallerRunsPolicy는 제출한 스레드가 직접 실행해 유입 속도를 늦추며, Discard 계열은 작업을 버립니다. 버리는 정책을 쓰면 반드시 메트릭이나 로그로 남깁니다.",
          followUps: [
            [
              "CallerRunsPolicy의 단점은 무엇인가요?",
              "거절된 작업을 톰캣 요청 스레드가 직접 실행하게 되면 그 요청의 응답 시간이 길어지고, 결국 요청 스레드 풀까지 바빠질 수 있습니다. 백프레셔 효과와 응답 지연 사이의 절충입니다."
            ]
          ],
          related: ["cs/threadpoolexecutor-paramiteo", "cs/rate-limiting"]
        },
        {
          id: "cs/seuredeu-pul-keugi-sanjeong",
          slug: "seuredeu-pul-keugi-sanjeong",
          title: "스레드 풀 크기 산정",
          deep: false,
          def: "작업이 CPU를 쓰는지, I/O를 기다리는지에 따라 적절한 스레드 수를 추정하는 방법이다.",
          why: "스레드가 너무 적으면 CPU가 놀고, 너무 많으면 컨텍스트 스위칭과 메모리 비용이 커지므로, 작업 성격에 맞는 크기를 정하기 위해서다.",
          how: [
            "- CPU 바운드 작업(계산, 압축, 암호화): 코어 수 + 1 정도. 스레드가 더 많아도 코어를 나눠 쓸 뿐이라 컨텍스트 스위칭만 늘어난다.",
            "- I/O 바운드 작업(DB, 외부 API 호출): 스레드가 기다리는 동안 다른 스레드가 CPU를 쓸 수 있어 더 많이 둔다.",
            "브라이언 고츠의 공식: 스레드 수 ≈ 코어 수 × 목표 CPU 사용률 × (1 + 대기 시간 / 계산 시간). 대기가 계산의 9배라면 8코어에서 약 80개다.",
            "공식은 출발점일 뿐이며, 부하 테스트로 처리량과 지연 시간이 가장 좋은 지점을 찾는다.",
            "스레드를 늘려도 DB 커넥션 풀이 10개라면 나머지 스레드는 커넥션을 기다리기만 한다. 아래쪽 자원 크기와 함께 맞춘다."
          ],
          use: [
            "외부 API 응답이 평균 180ms, 처리가 20ms인 8코어 서버에서 약 80개로 시작해 부하 테스트로 조정한다.",
            "이미지 리사이즈 같은 CPU 작업용 풀은 코어 수에 맞춰 따로 분리한다."
          ],
          warn: ["`Runtime.getRuntime().availableProcessors()`는 컨테이너의 CPU 제한을 반영한다(최신 JDK). 호스트 코어 수와 다를 수 있다."],
          myth: [
            [
              "스레드를 많이 둘수록 처리량이 늘어난다.",
              "CPU 작업은 코어 수를 넘으면 컨텍스트 스위칭만 늘고, I/O 작업도 DB 커넥션 같은 한정 자원에서 막혀 기다리기만 합니다."
            ]
          ],
          answer: "스레드 풀 크기는 작업 성격으로 정합니다. CPU 바운드 작업은 코어 수 + 1 정도가 적당하고, I/O 바운드 작업은 코어 수 × (1 + 대기 시간 / 계산 시간)으로 더 크게 잡습니다. 공식은 출발점이고 부하 테스트로 맞추며, DB 커넥션 풀 같은 아래쪽 자원 크기도 함께 고려합니다.",
          followUps: [
            [
              "스레드 풀 크기를 정할 때 DB 커넥션 풀은 왜 같이 봐야 하나요?",
              "작업마다 DB 커넥션이 필요한데 커넥션이 10개뿐이면 스레드를 100개 둬도 90개는 커넥션을 기다립니다. 병목 자원의 크기에 맞춰 스레드 수와 타임아웃을 정해야 합니다."
            ]
          ],
          related: ["cs/threadpoolexecutor-paramiteo", "cs/keontekseuteu-seuwiching"]
        },
        {
          id: "cs/executors-paektori-hamjeong",
          slug: "executors-paektori-hamjeong",
          title: "Executors 팩토리 함정",
          deep: false,
          def: "`Executors`의 편의 메서드가 만드는 스레드 풀은 큐나 스레드 수가 무제한이라 운영 환경에서 메모리 부족을 일으킬 수 있다.",
          why: "`newFixedThreadPool`의 무제한 큐나 `newCachedThreadPool`의 무제한 스레드가 부하 시 `OutOfMemoryError`를 일으킬 수 있음을 알기 위해서다.",
          how: [
            "- `newFixedThreadPool(n)`: 스레드는 n개로 고정되지만 큐가 무제한 `LinkedBlockingQueue`다. 처리보다 유입이 많으면 작업이 끝없이 쌓여 OOM이 난다.",
            "- `newSingleThreadExecutor()`: 위와 같은 문제가 있다.",
            "- `newCachedThreadPool()`: 큐 없이(SynchronousQueue) 스레드를 최대 `Integer.MAX_VALUE`까지 만든다. 폭주하면 스레드가 수천 개 생긴다.",
            "- `newScheduledThreadPool(n)`: 지연·주기 작업용. 작업 안에서 예외가 나면 이후 실행이 조용히 멈춘다.",
            "- `newVirtualThreadPerTaskExecutor()`(Java 21): 작업마다 가상 스레드를 만든다. 스레드 수 제한이 없으므로 DB 같은 한정 자원은 세마포어로 보호한다.",
            "알리바바 자바 코딩 가이드 등은 운영 코드에서 `ThreadPoolExecutor`를 직접 생성하라고 권한다."
          ],
          use: [
            "코드 리뷰에서 `Executors.newFixedThreadPool`을 크기가 정해진 `ArrayBlockingQueue`를 쓰는 `ThreadPoolExecutor`로 바꾸도록 규칙을 둔다."
          ],
          answer: "Executors의 편의 메서드는 운영에서 위험할 수 있습니다. newFixedThreadPool은 큐가 무제한이라 작업이 쌓이면 메모리가 부족해지고, newCachedThreadPool은 스레드를 사실상 무제한으로 만듭니다. 그래서 운영 코드에서는 큐 크기와 거절 정책을 명시한 ThreadPoolExecutor를 직접 생성합니다.",
          followUps: [
            [
              "newScheduledThreadPool에서 작업이 갑자기 멈추는 이유는?",
              "주기 작업 안에서 예외가 밖으로 던져지면 이후 실행이 조용히 취소됩니다. 작업 본문을 try-catch로 감싸 예외를 로그로 남기고 다음 실행이 계속되게 합니다."
            ]
          ],
          related: ["cs/threadpoolexecutor-paramiteo", "cs/semaphore-keulraeseu"]
        }
      ]
    },
    {
      name: "비동기 결과",
      compare: {
        cols: ["기준", "Future", "CompletableFuture"],
        rows: [
          ["결과 받기", "get()으로 블로킹", "콜백으로 이어 받기"],
          ["작업 조합", "불가", "thenCompose, allOf 등"],
          ["예외 처리", "get()에서 ExecutionException", "exceptionally, handle"],
          ["직접 완료", "불가", "complete()로 가능"]
        ]
      },
      concepts: [
        {
          id: "cs/future",
          slug: "future",
          title: "Future",
          deep: false,
          def: "비동기 작업의 결과를 나중에 받기 위한 핸들로, 완료 여부 확인, 결과 조회, 취소 기능을 제공한다.",
          why: "다른 스레드에 맡긴 작업의 결과를 나중에 받아야 하는데, 작업이 끝났는지 알고 결과나 예외를 안전하게 꺼낼 방법이 필요하기 때문이다.",
          how: [
            "- `get()`: 결과가 나올 때까지 호출 스레드를 블로킹한다. `get(timeout, unit)`으로 최대 대기 시간을 줄 수 있다.",
            "- `isDone()`, `isCancelled()`: 상태를 확인한다.",
            "- `cancel(mayInterrupt)`: 작업을 취소한다. true면 실행 중인 스레드에 인터럽트를 보낸다.",
            "- 작업에서 난 예외는 `get()` 호출 시 `ExecutionException`으로 감싸져 나온다.",
            "한계: 결과를 받으려면 결국 블로킹해야 하고, \"끝나면 다음 작업 실행\" 같은 조합이나 여러 Future를 합치는 기능이 없다. 이 한계를 해결한 것이 CompletableFuture다."
          ],
          use: ["보고서 생성 작업을 제출해 두고 `get(5, SECONDS)`로 최대 5초까지만 결과를 기다린다."],
          warn: ["타임아웃 없는 `get()`은 작업이 멈추면 호출 스레드도 영원히 멈춘다."],
          answer: "Future는 비동기 작업의 결과를 나중에 받기 위한 핸들로, get, isDone, cancel을 제공합니다. 결과를 받으려면 get()으로 블로킹해야 하고, 작업을 이어 붙이거나 여러 결과를 합치는 기능이 없습니다. 이 한계를 해결한 것이 CompletableFuture입니다.",
          followUps: [
            [
              "Future.cancel(true)를 호출하면 작업이 바로 멈추나요?",
              "실행 중인 스레드에 인터럽트를 보낼 뿐이라, 작업 코드가 인터럽트를 확인하거나 블로킹 메서드에서 InterruptedException을 받아야 실제로 멈춥니다. 인터럽트를 무시하는 코드는 계속 실행됩니다."
            ]
          ],
          related: ["cs/executorservice", "cs/completablefuture"]
        },
        {
          id: "cs/completablefuture",
          slug: "completablefuture",
          title: "CompletableFuture",
          deep: true,
          def: "비동기 작업의 결과를 콜백으로 이어 붙이고, 여러 작업을 조합하며, 예외를 처리할 수 있는 Java 8의 비동기 프로그래밍 도구다.",
          why: "상품 정보, 재고, 리뷰를 각각 다른 API에서 가져와 합쳐야 할 때 순서대로 호출하면 지연 시간이 더해진다. 동시에 호출하고 결과를 블로킹 없이 조합하려고 쓴다.",
          how: [
            "- 시작: `supplyAsync(supplier, executor)`(결과 있음), `runAsync(runnable, executor)`(결과 없음).",
            "- 변환: `thenApply(fn)`은 결과를 바꾸고, `thenAccept(consumer)`는 결과를 소비한다.",
            "- 이어 붙이기: `thenCompose(fn)`은 다음 비동기 작업을 연결한다(flatMap에 해당).",
            "- 합치기: `thenCombine(other, fn)`은 두 결과를 합치고, `allOf(...)`는 모두 끝날 때, `anyOf(...)`는 하나라도 끝날 때 완료된다.",
            "- 예외 처리: `exceptionally(fn)`으로 대체값을 주고, `handle((result, ex) -> ...)`으로 성공과 실패를 함께 처리한다.",
            "- 타임아웃: `orTimeout(1, SECONDS)`, `completeOnTimeout(default, 1, SECONDS)`(Java 9+).",
            "executor를 지정하지 않으면 공용 `ForkJoinPool.commonPool()`에서 실행된다. 이 풀은 CPU 코어 수 기준으로 작게 잡혀 있어 I/O 작업을 넣으면 다른 병렬 스트림까지 함께 막힌다.",
            "`...Async` 접미사가 붙은 메서드는 콜백을 다른 스레드에서 실행하고, 붙지 않은 메서드는 앞 작업을 완료한 스레드에서 실행한다."
          ],
          flow: [
            "supplyAsync로 작업 시작",
            "완료 시 thenApply 변환",
            "thenCombine으로 결과 합침",
            "실패 시 exceptionally",
            "join으로 최종 결과"
          ],
          code: "ExecutorService io = Executors.newFixedThreadPool(20);\n\nCompletableFuture<Product> product = CompletableFuture.supplyAsync(() -> productApi.get(id), io);\nCompletableFuture<Stock> stock = CompletableFuture.supplyAsync(() -> stockApi.get(id), io);\n\nProductView view = product\n    .thenCombine(stock, ProductView::new)           // 두 결과 합치기\n    .orTimeout(2, TimeUnit.SECONDS)                 // 전체 2초 제한\n    .exceptionally(ex -> ProductView.fallback(id))  // 실패 시 대체 응답\n    .join();",
          codeLang: "java",
          use: [
            "상품 상세 화면에서 상품, 재고, 리뷰 API를 동시에 호출해 응답 시간을 가장 느린 API 하나 수준으로 줄인다.",
            "여러 파트너사 가격 조회를 allOf로 모은 뒤 orTimeout으로 2초 안에 응답한 것만 보여 준다."
          ],
          warn: [
            "I/O 작업에는 반드시 전용 executor를 넘긴다. 공용 ForkJoinPool을 쓰면 서비스 전체가 느려질 수 있다.",
            "`join()`이나 `get()`을 체인 중간마다 부르면 결국 동기 코드와 다를 바가 없다.",
            "스프링의 트랜잭션, SecurityContext, MDC 로그 정보는 다른 스레드로 자동 전파되지 않는다."
          ],
          myth: [
            [
              "thenApply는 항상 다른 스레드에서 실행된다.",
              "Async 접미사가 없으면 앞 작업을 완료한 스레드나 호출 스레드에서 실행됩니다. 다른 풀에서 실행하려면 thenApplyAsync에 executor를 넘깁니다."
            ]
          ],
          answer: "CompletableFuture는 비동기 결과를 콜백으로 이어 붙이고 여러 작업을 조합하며 예외를 처리할 수 있는 도구입니다. supplyAsync로 시작해 thenApply, thenCompose, thenCombine, allOf로 조합하고 exceptionally로 실패를 처리합니다. executor를 지정하지 않으면 공용 ForkJoinPool을 쓰므로 I/O 작업에는 전용 풀을 넘기는 것이 중요합니다.",
          analogy: "여러 가게에 동시에 주문을 넣고, 음식이 다 도착하면 한 상에 차리는 것과 같습니다. 하나씩 기다렸다 주문하는 것보다 전체 시간이 짧습니다.",
          qa: [
            "CompletableFuture를 쓸 때 주의할 점은 무엇인가요?",
            "가장 중요한 것은 실행 스레드 풀입니다. executor를 넘기지 않으면 공용 ForkJoinPool에서 실행되는데, 코어 수만큼 작게 잡혀 있어 I/O 작업이 몰리면 애플리케이션 전체의 병렬 처리가 막힙니다. 그래서 I/O용 전용 풀을 지정하고, orTimeout으로 시간 제한을 두고, exceptionally나 handle로 예외를 처리합니다. 또 스레드가 바뀌므로 트랜잭션이나 ThreadLocal 기반 정보가 전파되지 않는다는 점도 고려해야 합니다."
          ],
          followUps: [
            [
              "thenApply와 thenCompose의 차이는?",
              "thenApply는 결과를 일반 값으로 바꾸는 변환이고, thenCompose는 결과로 또 다른 CompletableFuture를 만드는 비동기 작업을 이어 붙이는 것입니다. thenApply로 비동기 작업을 연결하면 CompletableFuture가 중첩됩니다."
            ],
            [
              "allOf로 기다린 결과는 어떻게 꺼내나요?",
              "allOf는 결과 없이 모두 완료됐다는 신호만 주므로, 완료 후 각 future의 join()으로 값을 꺼내 모읍니다. 하나라도 예외로 끝나면 allOf도 예외로 완료되므로 개별 future에 exceptionally를 먼저 붙여 두는 경우가 많습니다."
            ],
            [
              "스프링에서 CompletableFuture를 쓰면 트랜잭션은 어떻게 되나요?",
              "트랜잭션은 ThreadLocal로 스레드에 묶여 있어 다른 스레드에서 실행되는 작업에는 전파되지 않습니다. 비동기 작업 안에서 DB를 바꿔야 하면 그 작업 안에서 별도 트랜잭션을 시작해야 합니다."
            ]
          ],
          related: ["cs/future", "cs/executorservice", "cs/threadlocal-sayongbeop"]
        }
      ]
    },
    {
      name: "동시성 컬렉션",
      compare: {
        cols: ["기준", "ConcurrentHashMap", "CopyOnWriteArrayList", "BlockingQueue"],
        rows: [
          ["자료구조", "해시 맵", "리스트", "큐"],
          ["동기화 방식", "CAS + 버킷 단위 락", "쓰기 시 배열 복사", "락 + 조건 대기"],
          ["읽기 비용", "락 없음", "락 없음", "락 사용"],
          ["적합한 곳", "공유 캐시, 카운터", "읽기 많은 리스너 목록", "생산자-소비자"]
        ]
      },
      concepts: [
        {
          id: "cs/concurrenthashmap",
          slug: "concurrenthashmap",
          title: "ConcurrentHashMap",
          deep: true,
          def: "여러 스레드가 동시에 읽고 써도 안전하면서, 맵 전체를 잠그지 않아 높은 동시성을 내는 해시 맵이다.",
          why: "`HashMap`은 동시에 쓰면 데이터가 유실되거나 깨지고, `Collections.synchronizedMap`이나 `Hashtable`은 모든 연산이 하나의 락을 써서 느리다. 캐시나 카운터처럼 여러 스레드가 함께 쓰는 맵에 필요하다.",
          how: [
            "Java 8 이후 구조는 HashMap과 같은 버킷 배열이다.",
            "1) 읽기(`get`)는 락 없이 volatile 읽기로 처리한다.",
            "2) 빈 버킷에 넣을 때는 CAS로 첫 노드를 넣는다.",
            "3) 이미 노드가 있는 버킷에 넣을 때는 그 버킷의 첫 노드에만 `synchronized`를 건다. 서로 다른 버킷은 동시에 쓸 수 있다.",
            "4) 한 버킷의 노드가 8개를 넘으면(테이블 크기 64 이상일 때) 레드블랙 트리로 바꾼다.",
            "5) 크기를 늘릴 때는 여러 스레드가 나눠서 버킷을 옮긴다.",
            "Java 7까지는 맵을 16개 Segment로 나눠 Segment 단위로 락을 걸었다.",
            "- `null` 키와 값을 허용하지 않는다. `get`이 null을 돌려주면 \"없음\"인지 \"null 값\"인지 구분할 수 없기 때문이다.",
            "- `size()`는 LongAdder처럼 나눠 센 값을 합친 추정치라 동시 수정 중에는 정확하지 않을 수 있다.",
            "- 순회는 약한 일관성(weakly consistent)이라 ConcurrentModificationException이 나지 않지만 최신 변경이 보이지 않을 수 있다."
          ],
          flow: ["키 해시로 버킷 찾기", "빈 버킷이면 CAS로 삽입", "노드 있으면 첫 노드 잠금", "8개 초과 시 트리로 변환", "용량 초과 시 함께 확장"],
          code: "ConcurrentHashMap<String, LongAdder> counts = new ConcurrentHashMap<>();\n\n// 위험: 확인 후 넣기가 두 단계라 경쟁 상태\n// if (!map.containsKey(k)) map.put(k, v);\n\n// 안전: 원자적 복합 연산\ncounts.computeIfAbsent(word, k -> new LongAdder()).increment();\nmap.putIfAbsent(key, value);\nmap.merge(key, 1, Integer::sum);",
          codeLang: "java",
          use: [
            "요청 경로별 호출 횟수를 `ConcurrentHashMap<String, LongAdder>`로 센다.",
            "외부 설정 조회 결과를 `computeIfAbsent`로 한 번만 계산해 서버 안에서 공유한다."
          ],
          warn: [
            "개별 연산만 원자적이다. `containsKey` 후 `put`처럼 두 연산을 이어 쓰면 경쟁 상태가 생긴다. `computeIfAbsent`, `merge`, `putIfAbsent`를 쓴다.",
            "`computeIfAbsent` 안에서 같은 맵을 다시 수정하면 데드락이나 예외가 날 수 있다. 계산 함수는 짧고 단순하게 둔다."
          ],
          myth: [
            [
              "ConcurrentHashMap을 쓰면 어떤 사용 방식이든 안전하다.",
              "`containsKey` 후 `put`처럼 두 연산을 이어 쓰면 그 사이에 다른 스레드가 끼어듭니다. 원자적 복합 메서드를 써야 합니다."
            ]
          ],
          answer: "ConcurrentHashMap은 Java 8 이후 버킷 단위로 동기화하는 스레드 안전 맵입니다. 읽기는 락 없이, 빈 버킷 삽입은 CAS로, 노드가 있는 버킷은 첫 노드에만 synchronized를 걸어 서로 다른 버킷을 동시에 수정할 수 있습니다. 다만 개별 연산만 원자적이라 확인 후 넣기는 computeIfAbsent나 merge를 써야 하고, null 키와 값은 허용하지 않습니다.",
          analogy: "은행 창구가 하나인 Hashtable과 달리, 창구가 버킷 수만큼 있어 서로 다른 창구의 손님은 동시에 처리되는 은행입니다.",
          qa: [
            "ConcurrentHashMap은 어떻게 동시성을 보장하나요?",
            "Java 8 이후에는 맵 전체가 아니라 버킷 단위로 동기화합니다. 읽기는 락 없이 volatile로 처리하고, 빈 버킷에 넣을 때는 CAS를, 노드가 있는 버킷에 넣을 때는 그 버킷의 첫 노드에만 synchronized를 겁니다. 그래서 서로 다른 버킷은 동시에 수정할 수 있어 Hashtable보다 훨씬 동시성이 높습니다. 다만 개별 연산만 원자적이라 복합 연산은 computeIfAbsent나 merge를 써야 합니다."
          ],
          followUps: [
            [
              "null 키와 값을 허용하지 않는 이유는?",
              "동시성 환경에서는 get이 null을 돌려줄 때 키가 없는 것인지 값이 null인지 다른 스레드의 변경 없이 확인할 방법이 없습니다. 이 모호성을 없애려고 null을 금지했습니다."
            ],
            [
              "Java 7과 8의 구현 차이는?",
              "Java 7은 맵을 Segment 여러 개로 나누고 Segment마다 락을 걸어 동시성 수준이 Segment 수로 제한됐습니다. Java 8은 Segment를 없애고 버킷 단위 CAS와 synchronized를 써서 더 세밀하게 동시성을 높였고, 긴 버킷은 레드블랙 트리로 바꿉니다."
            ]
          ],
          related: ["ds/haesi-teibeul", "cs/cas", "cs/synchronized", "cs/atomic-keulraeseu"]
        },
        {
          id: "cs/copyonwritearraylist",
          slug: "copyonwritearraylist",
          title: "CopyOnWriteArrayList",
          deep: false,
          def: "쓰기가 일어날 때마다 내부 배열 전체를 복사해 새 배열로 바꾸고, 읽기는 락 없이 하는 스레드 안전 리스트다.",
          why: "읽기가 압도적으로 많은 리스트에서 순회 중 수정으로 생기는 `ConcurrentModificationException`과 락 경합을 피하기 위해서다.",
          how: [
            "- 읽기와 순회는 락 없이 그 순간의 배열 스냅샷을 본다. 순회 중 다른 스레드가 수정해도 ConcurrentModificationException이 나지 않는다.",
            "- 쓰기(add, remove)는 락을 잡고 배열을 통째로 복사한다. 원소가 많고 쓰기가 잦으면 매우 느리고 메모리를 많이 쓴다.",
            "- 적합: 이벤트 리스너 목록, 거의 바뀌지 않는 설정 목록처럼 읽기가 압도적으로 많은 경우.",
            "같은 원리의 Set 버전으로 `CopyOnWriteArraySet`이 있다."
          ],
          use: ["애플리케이션 이벤트 리스너 목록을 저장해 이벤트를 발행할 때 동시 순회한다."],
          answer: "CopyOnWriteArrayList는 쓰기마다 배열 전체를 복사하고, 읽기는 락 없이 스냅샷을 보는 스레드 안전 리스트입니다. 순회 중 수정이 있어도 예외가 나지 않습니다. 쓰기 비용이 커서 이벤트 리스너 목록처럼 읽기가 압도적으로 많은 곳에만 씁니다.",
          followUps: [["순회 중에 추가한 원소가 바로 보이나요?", "아닙니다. 순회는 시작 시점의 배열 스냅샷을 보므로 이후 추가된 원소는 그 순회에서 보이지 않습니다."]],
          related: ["cs/readwritelock", "cs/concurrenthashmap"]
        },
        {
          id: "cs/blockingqueue",
          slug: "blockingqueue",
          title: "BlockingQueue",
          deep: false,
          def: "큐가 비어 있으면 꺼내려는 스레드를, 가득 차 있으면 넣으려는 스레드를 기다리게 하는 스레드 안전 큐로, 생산자-소비자 패턴의 기본 도구다.",
          why: "생산자와 소비자 스레드 사이에서 큐가 비거나 찼을 때 직접 `wait`/`notify`로 대기를 구현하는 복잡하고 위험한 코드를 없애기 위해서다.",
          how: [
            "- `put()`/`take()`: 공간이나 원소가 생길 때까지 블로킹한다.",
            "- `offer(e, timeout)`/`poll(timeout)`: 정해진 시간만 기다린다.",
            "- `ArrayBlockingQueue`: 배열 기반, 크기 고정. 메모리를 예측할 수 있다.",
            "- `LinkedBlockingQueue`: 연결 리스트 기반. 크기를 주지 않으면 사실상 무제한이다.",
            "- `SynchronousQueue`: 저장 공간이 없어 넣는 쪽과 꺼내는 쪽이 직접 만나야 한다. `newCachedThreadPool`이 사용한다.",
            "- `PriorityBlockingQueue`, `DelayQueue`: 우선순위나 지연 시간 순서로 꺼낸다.",
            "스레드 풀의 작업 큐가 바로 BlockingQueue이며, 크기를 정해 두면 생산 속도를 소비 속도에 맞추는 백프레셔 역할을 한다."
          ],
          use: ["업로드 파일 처리를 생산자 스레드가 큐에 넣고, 소비자 스레드 4개가 꺼내 처리하는 파이프라인을 만든다."],
          answer: "BlockingQueue는 비어 있으면 꺼내는 쪽을, 가득 차면 넣는 쪽을 기다리게 하는 스레드 안전 큐로 생산자-소비자 패턴의 기본입니다. ArrayBlockingQueue는 크기가 고정이고, LinkedBlockingQueue는 크기를 주지 않으면 사실상 무제한입니다. 스레드 풀의 작업 큐도 BlockingQueue입니다.",
          followUps: [
            [
              "put/take와 offer/poll의 차이는?",
              "put과 take는 공간이나 원소가 생길 때까지 무한정 기다리고, offer와 poll은 즉시 또는 지정한 시간까지만 기다린 뒤 실패를 반환합니다. 서버 코드에서는 무한 대기를 피하려고 시간 제한 버전을 많이 씁니다."
            ]
          ],
          related: ["cs/threadpoolexecutor-paramiteo", "ds/kyu"]
        }
      ]
    },
    {
      name: "동기화 보조 도구",
      compare: {
        cols: ["기준", "CountDownLatch", "CyclicBarrier", "Semaphore 클래스"],
        rows: [
          ["목적", "N개 작업 완료 대기", "N개 스레드 서로 대기", "동시 실행 수 제한"],
          ["재사용", "불가 (일회용)", "가능", "가능"],
          ["기다리는 쪽", "다른 스레드가 기다림", "참여 스레드끼리", "허가가 없는 스레드"],
          ["대표 메서드", "countDown, await", "await", "acquire, release"]
        ]
      },
      concepts: [
        {
          id: "cs/countdownlatch",
          slug: "countdownlatch",
          title: "CountDownLatch",
          deep: false,
          def: "정해진 횟수만큼 `countDown()`이 호출될 때까지 `await()`한 스레드들을 기다리게 하는 일회용 동기화 도구다.",
          why: "여러 스레드의 작업이 모두 끝날 때까지 메인 스레드가 기다려야 할 때, 직접 카운터와 대기 로직을 짜지 않기 위해서다.",
          how: [
            "생성할 때 카운트를 정하고, 작업 스레드가 끝날 때마다 `countDown()`을 호출한다. 카운트가 0이 되면 `await()`로 기다리던 스레드가 모두 깨어난다.",
            "- 용도: 여러 초기화 작업이 모두 끝난 뒤 서비스를 시작할 때, 테스트에서 여러 스레드가 동시에 출발하게 할 때.",
            "- 한 번 0이 되면 다시 쓸 수 없다. 반복해서 쓰려면 CyclicBarrier를 쓴다.",
            "- `countDown()`은 반드시 finally에서 호출한다. 예외로 빠뜨리면 기다리는 스레드가 영원히 멈춘다."
          ],
          flow: ["카운트 N으로 생성", "작업마다 countDown 호출", "0이 될 때까지 await 대기", "0이 되면 대기 스레드 해제"],
          code: "CountDownLatch latch = new CountDownLatch(3);\nfor (int i = 0; i < 3; i++) {\n    pool.submit(() -> {\n        try { loadCache(); } finally { latch.countDown(); }\n    });\n}\nlatch.await(10, TimeUnit.SECONDS); // 3개가 끝날 때까지(최대 10초) 대기",
          codeLang: "java",
          use: ["동시성 테스트에서 시작 신호용 래치로 스레드 100개를 동시에 출발시켜 쿠폰 중복 발급 여부를 검증한다."],
          answer: "CountDownLatch는 정해진 횟수만큼 countDown이 호출될 때까지 await한 스레드를 기다리게 하는 일회용 도구입니다. 여러 초기화 작업이 끝난 뒤 시작하거나, 테스트에서 여러 스레드를 동시에 출발시킬 때 씁니다. countDown은 finally에서 호출해야 예외 시 영원히 기다리는 일을 막습니다.",
          analogy: "로켓 발사 카운트다운과 같습니다. 0이 되면 기다리던 모두가 출발하고, 한 번 끝난 카운트다운은 다시 쓰지 않습니다.",
          followUps: [
            [
              "CountDownLatch와 Thread.join의 차이는?",
              "join은 특정 스레드가 끝나기를 기다리지만, CountDownLatch는 스레드 종료와 관계없이 원하는 지점에서 신호를 줄 수 있어 스레드 풀 작업에도 쓸 수 있습니다."
            ]
          ],
          related: ["cs/cyclicbarrier", "cs/semaphore-keulraeseu"]
        },
        {
          id: "cs/cyclicbarrier",
          slug: "cyclicbarrier",
          title: "CyclicBarrier",
          deep: false,
          def: "정해진 수의 스레드가 모두 같은 지점(배리어)에 도착할 때까지 서로 기다렸다가 함께 다음 단계로 넘어가게 하는 재사용 가능한 도구다.",
          why: "여러 스레드가 단계마다 모두 도착한 뒤에 다 같이 다음 단계로 넘어가야 하는 작업을 반복해서 동기화하기 위해서다.",
          how: [
            "- 각 스레드가 `await()`를 호출하면 정해진 수가 모일 때까지 기다린다. 모두 모이면 함께 풀려나고 배리어가 초기화되어 다시 쓸 수 있다.",
            "- 생성자에 배리어 동작(Runnable)을 주면 모두 도착했을 때 한 번 실행된다(단계별 결과 합치기).",
            "- 기다리던 스레드 하나가 인터럽트되거나 타임아웃되면 배리어가 깨져 나머지도 `BrokenBarrierException`을 받는다.",
            "CountDownLatch는 \"다른 작업들이 끝나기를 한쪽이 기다리는\" 도구이고, CyclicBarrier는 \"같은 스레드들이 서로를 기다리는\" 도구라는 점이 다르다."
          ],
          use: ["대용량 데이터를 4개 스레드가 나눠 처리하고, 단계마다 중간 결과를 배리어 동작에서 합친다."],
          answer: "CyclicBarrier는 정해진 수의 스레드가 모두 배리어에 도착할 때까지 서로 기다렸다가 함께 다음 단계로 넘어가게 하는 도구입니다. 모두 도착하면 초기화되어 다시 쓸 수 있고, 도착 시점에 한 번 실행할 배리어 동작을 줄 수 있습니다. 같은 스레드들이 단계별로 보조를 맞출 때 씁니다.",
          followUps: [
            [
              "기다리던 스레드 하나가 타임아웃되면 어떻게 되나요?",
              "배리어가 깨진 상태가 되어 기다리던 나머지 스레드도 BrokenBarrierException을 받습니다. 다시 쓰려면 reset()으로 초기화해야 합니다."
            ]
          ],
          related: ["cs/countdownlatch"]
        },
        {
          id: "cs/semaphore-keulraeseu",
          slug: "semaphore-keulraeseu",
          title: "Semaphore 클래스",
          deep: false,
          def: "`java.util.concurrent.Semaphore`는 허가(permit) 개수만큼만 동시에 실행되도록 제한하는 도구다.",
          why: "DB 커넥션이나 외부 API 호출처럼 동시에 쓸 수 있는 개수가 제한된 자원에 접근하는 스레드 수를 제한하기 위해서다.",
          how: [
            "- `acquire()`로 허가를 하나 얻고, 다 쓰면 `release()`로 돌려준다. 허가가 없으면 생길 때까지 기다린다.",
            "- `tryAcquire(timeout)`으로 정해진 시간만 기다릴 수 있다.",
            "- 용도: 외부 API 동시 호출 수 제한, DB 같은 한정 자원 보호, 가상 스레드 환경에서 동시 실행 수 제한.",
            "- 공정성 옵션(`new Semaphore(n, true)`)으로 오래 기다린 스레드부터 허가를 받게 할 수 있다.",
            "락과 달리 소유권이 없어 다른 스레드가 release할 수 있으므로, 획득한 쪽이 finally에서 반드시 돌려주도록 규칙을 지킨다."
          ],
          code: "private final Semaphore limit = new Semaphore(10); // 동시 10개\n\nResponse call() throws InterruptedException {\n    limit.acquire();\n    try {\n        return externalApi.request();\n    } finally {\n        limit.release();\n    }\n}",
          codeLang: "java",
          use: [
            "초당 호출 제한이 있는 파트너 API 클라이언트를 허가 10개 세마포어로 감싸 동시 호출을 10개로 묶는다.",
            "가상 스레드로 작업을 대량 실행할 때 DB 접근 구간을 세마포어로 보호한다."
          ],
          answer: "Semaphore 클래스는 허가 개수만큼만 동시에 실행되도록 제한하는 도구로, acquire로 얻고 release로 돌려줍니다. 외부 API 동시 호출 수나 한정된 자원 접근을 제한할 때 씁니다. 락과 달리 소유권이 없어 finally에서 반드시 release하는 규칙을 지켜야 합니다.",
          followUps: [
            [
              "Semaphore(1)과 락의 차이는?",
              "허가가 1개인 세마포어도 상호 배제를 하지만 소유권이 없어 다른 스레드가 release할 수 있고 재진입도 되지 않습니다. 실수로 release를 두 번 하면 허가가 2개가 되는 문제도 생깁니다."
            ]
          ],
          related: ["cs/semapoeo", "cs/executors-paektori-hamjeong"]
        }
      ]
    },
    {
      name: "스레드 안전 설계",
      compare: {
        cols: ["기준", "불변 객체와 스레드 안전", "ThreadLocal 사용법"],
        rows: [
          ["안전한 이유", "상태가 바뀌지 않음", "스레드마다 값 분리"],
          ["공유 여부", "여러 스레드가 공유", "공유하지 않음"],
          ["대표 예", "`String`, `record`, `final` 필드", "트랜잭션, 보안 컨텍스트"],
          ["주의점", "가변 필드 방어적 복사", "스레드 풀에서 `remove()` 필수"]
        ]
      },
      concepts: [
        {
          id: "cs/bulbyeon-gaekchewa-seuredeu-anjeon",
          slug: "bulbyeon-gaekchewa-seuredeu-anjeon",
          title: "불변 객체와 스레드 안전",
          deep: false,
          def: "생성된 뒤 상태가 바뀌지 않는 객체는 동기화 없이 여러 스레드가 공유해도 항상 안전하다.",
          why: "상태가 바뀌지 않는 객체는 여러 스레드가 공유해도 락 없이 안전하므로, 동기화 버그를 설계 단계에서 없애기 위해서다.",
          how: [
            "불변 객체를 만드는 규칙:",
            "- 클래스를 `final`로 선언하거나 생성자를 숨겨 상속으로 상태가 바뀌지 않게 한다.",
            "- 모든 필드를 `private final`로 둔다.",
            "- setter를 두지 않는다. 값을 바꾸려면 새 객체를 돌려준다(`withPrice()`).",
            "- 가변 객체(List, Date)를 받거나 돌려줄 때는 방어적 복사를 하거나 `List.copyOf`로 불변 컬렉션을 쓴다.",
            "`final` 필드는 생성자가 끝난 뒤 다른 스레드에서도 초기화된 값으로 보인다는 JMM 보장이 있다. 단, 생성자 안에서 `this`를 밖으로 넘기면 이 보장이 깨진다.",
            "Java의 `String`, `Integer`, `LocalDateTime`, `record`(얕은 불변) 등이 대표적인 불변 타입이다."
          ],
          use: [
            "설정값을 record로 만들고, 설정이 바뀌면 새 record를 만들어 참조를 교체한다.",
            "DTO와 값 객체(Money, Address)를 불변으로 설계해 여러 스레드에서 공유한다."
          ],
          warn: ["record의 필드가 `List` 같은 가변 객체면 그 내용은 바뀔 수 있다. 생성자에서 `List.copyOf`로 감싼다."],
          myth: [
            [
              "record면 무조건 완전한 불변이다.",
              "record는 필드 재할당만 막는 얕은 불변입니다. List 같은 가변 필드는 생성자에서 List.copyOf로 감싸야 합니다."
            ]
          ],
          answer: "불변 객체는 생성 후 상태가 바뀌지 않으므로 동기화 없이 여러 스레드가 공유해도 안전합니다. final 클래스, private final 필드, setter 없음, 가변 객체의 방어적 복사가 규칙입니다. final 필드는 생성자가 끝난 뒤 다른 스레드에서 초기화된 값으로 보인다는 JMM 보장이 있습니다.",
          followUps: [
            [
              "생성자에서 this를 밖으로 넘기면 왜 위험한가요?",
              "생성이 끝나기 전에 다른 스레드가 객체를 보게 되어 final 필드조차 초기화되지 않은 값으로 보일 수 있습니다. 리스너 등록이나 스레드 시작은 생성자가 끝난 뒤에 합니다."
            ]
          ],
          related: ["cs/string-bulbyeonseong", "cs/java-memory-model"]
        },
        {
          id: "cs/threadlocal-sayongbeop",
          slug: "threadlocal-sayongbeop",
          title: "ThreadLocal 사용법",
          deep: false,
          def: "같은 변수를 스레드마다 독립된 값으로 갖게 해, 파라미터로 넘기지 않고도 한 요청 흐름 안에서 값을 공유하는 도구다.",
          why: "스레드 풀에서 스레드가 재사용되면 `remove`하지 않은 값이 다음 요청으로 새어 나가거나 메모리 누수가 생기므로, 올바른 사용법을 알기 위해서다.",
          how: [
            "- 스프링의 트랜잭션 동기화, SecurityContextHolder, 로그 MDC가 ThreadLocal로 구현되어 있다.",
            "- `set()`, `get()`, `remove()`로 쓰며, 값은 각 스레드 객체 안의 맵에 저장된다.",
            "- 스레드 풀은 스레드를 재사용하므로 요청이 끝나면 반드시 `remove()`해야 한다. 지우지 않으면 다음 요청이 이전 사용자의 값을 보고, 값이 계속 남아 메모리 누수가 된다.",
            "- 새로 만든 스레드나 다른 풀의 스레드에는 값이 전달되지 않는다. `InheritableThreadLocal`은 자식 스레드 생성 시점에만 복사하므로 스레드 풀과 함께 쓰면 엉뚱한 값이 남는다.",
            "- 가상 스레드는 수백만 개가 생길 수 있어 ThreadLocal에 큰 객체를 두면 메모리가 크게 늘어난다. Java 25에서 정식이 된 `ScopedValue`는 범위가 정해진 불변 값을 안전하게 공유하는 대안이다."
          ],
          code: "private static final ThreadLocal<String> TRACE_ID = new ThreadLocal<>();\n\nvoid handle(Request req) {\n    TRACE_ID.set(req.header(\"X-Trace-Id\"));\n    try {\n        service.process();\n    } finally {\n        TRACE_ID.remove();   // 스레드 재사용 대비 필수\n    }\n}",
          codeLang: "java",
          use: [
            "서블릿 필터에서 요청마다 traceId를 MDC에 넣고 finally에서 지워 로그마다 같은 요청을 묶어 본다.",
            "멀티테넌트 서비스에서 현재 테넌트 ID를 ThreadLocal로 두고 DataSource 라우팅에 쓴다."
          ],
          myth: [["ThreadLocal 값은 요청이 끝나면 자동으로 지워진다.", "톰캣 스레드는 재사용되므로 직접 remove하지 않으면 값이 남아 다음 요청에 노출됩니다."]],
          answer: "ThreadLocal은 같은 변수를 스레드마다 독립된 값으로 갖게 해, 파라미터 없이 한 요청 흐름 안에서 값을 공유하는 도구입니다. 스프링 트랜잭션, SecurityContextHolder, MDC가 이 방식입니다. 스레드 풀은 스레드를 재사용하므로 요청이 끝나면 반드시 remove해야 정보 섞임과 메모리 누수를 막을 수 있습니다.",
          analogy: "직원마다 따로 쓰는 개인 사물함과 같습니다. 다른 직원과 섞이지 않지만, 퇴근할 때 비우지 않으면 다음에 그 자리를 쓰는 사람이 이전 물건을 보게 됩니다.",
          followUps: [
            [
              "비동기 작업으로 ThreadLocal 값을 넘기려면 어떻게 하나요?",
              "작업을 제출할 때 현재 값을 꺼내 작업 안에서 다시 set하고 끝나면 remove하는 래퍼를 씁니다. 스프링에서는 TaskDecorator로 MDC나 SecurityContext를 복사하는 방식이 일반적입니다."
            ]
          ],
          related: ["cs/completablefuture", "cs/java-21", "cs/java-25"]
        }
      ]
    }
  ]
};

export default topic;
