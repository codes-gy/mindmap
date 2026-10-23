(window.MINDMAP = window.MINDMAP || {})['cs-10'] = {
  name: '자바 동시성',
  groups: [
    { name: '메모리 모델', items: [
      { t: 'Java Memory Model', deep: true,
        d: '여러 스레드가 메모리를 통해 상호작용할 때, 한 스레드가 쓴 값을 다른 스레드가 언제 어떤 순서로 볼 수 있는지 정한 자바 언어 명세(JLS 17장)의 규칙이다.',
        why: 'CPU 캐시, 레지스터, 컴파일러·CPU의 명령어 재배치 때문에 한 스레드의 쓰기가 다른 스레드에 바로 보이지 않을 수 있다. JMM은 어떤 조건에서 보이는 것이 보장되는지를 정해, 하드웨어가 달라도 같은 결과를 내는 동시성 코드를 쓸 수 있게 한다.',
        how: [
          '각 스레드는 개념적으로 메인 메모리의 값을 자기 작업 메모리(CPU 캐시, 레지스터)에 복사해 쓰고, 나중에 메인 메모리에 반영한다. 반영 시점이 정해져 있지 않아 다른 스레드는 오래된 값을 볼 수 있다.',
          'JMM은 이 문제를 세 가지 성질로 나눠 다룬다.',
          '- 원자성: 연산이 중간에 끊기지 않고 한 번에 실행되는가. `count++`는 원자적이지 않다.',
          '- 가시성: 한 스레드의 쓰기가 다른 스레드에 보이는가.',
          '- 순서성: 코드에 적힌 순서대로 실행된 것처럼 보이는가. 단일 스레드에서는 결과가 같다면 재배치가 허용된다.',
          '보장은 happens-before 관계로 표현한다. A가 B보다 happens-before이면 A의 결과는 B에서 반드시 보인다.',
          '`synchronized`, `volatile`, `final` 필드, `Thread.start()`/`join()`, `java.util.concurrent` 도구들이 이 관계를 만들어 주는 수단이다.'
        ],
        code: `class Worker {
    private boolean running = true;   // volatile이 없으면 가시성 보장 없음

    void stop() { running = false; }   // 스레드 A

    void run() {                       // 스레드 B
        while (running) {
            // JIT가 running을 레지스터에 올려 두면
            // A가 false로 바꿔도 영원히 반복할 수 있다
        }
    }
}`,
        warn: [
          '테스트에서 한 번 잘 돌았다고 안전한 것이 아니다. 가시성 버그는 하드웨어와 JIT 최적화에 따라 가끔씩만 드러난다.',
          'JMM 규칙 밖의 "그냥 잘 되겠지" 코드는 다른 CPU 아키텍처(ARM 등)에서 깨질 수 있다.'
        ],
        qa: ['자바 메모리 모델(JMM)이 무엇이고 왜 필요한가요?', '여러 스레드가 공유 변수를 읽고 쓸 때 어떤 값이 언제 보이는지 정한 규칙입니다. CPU 캐시와 명령어 재배치 때문에 한 스레드의 쓰기가 다른 스레드에 바로 보이지 않을 수 있는데, JMM은 happens-before 관계로 가시성과 순서를 보장하는 조건을 정의합니다. 그래서 synchronized나 volatile처럼 그 관계를 만드는 도구를 써야 플랫폼과 관계없이 올바른 동시성 코드가 됩니다.'],
        rel: ['happens-before', '가시성 문제', '명령어 재배치', 'volatile'] },
      { t: 'happens-before', deep: true,
        d: '동작 A의 결과가 동작 B에서 반드시 보이고 A가 B보다 먼저 일어난 것처럼 보장되는 관계로, JMM이 가시성과 순서를 정의하는 기준이다.',
        why: '시간상 먼저 실행됐다는 사실만으로는 다른 스레드가 그 결과를 본다는 보장이 없다. 어떤 코드가 결과를 확실히 넘겨주는지 판단하려면 happens-before 규칙으로 따져야 한다.',
        how: [
          '대표 규칙은 다음과 같다.',
          '- 프로그램 순서 규칙: 한 스레드 안에서 앞선 동작은 뒤 동작보다 happens-before다.',
          '- 모니터 락 규칙: 어떤 락의 unlock은 같은 락의 이후 lock보다 happens-before다.',
          '- volatile 규칙: volatile 변수 쓰기는 같은 변수의 이후 읽기보다 happens-before다.',
          '- 스레드 시작 규칙: `Thread.start()` 호출은 그 스레드 안의 모든 동작보다 happens-before다.',
          '- 스레드 종료 규칙: 스레드의 모든 동작은 다른 스레드가 `join()`으로 종료를 확인한 시점보다 happens-before다.',
          '- 전이성: A → B이고 B → C이면 A → C다.',
          '전이성 덕분에 volatile 쓰기 전에 한 일반 변수 쓰기도, volatile 읽기 뒤에서는 함께 보인다. 이를 이용해 데이터를 먼저 준비하고 마지막에 volatile 플래그를 세우는 방식으로 안전하게 넘겨줄 수 있다.'
        ],
        code: `class Publisher {
    private int data;               // 일반 변수
    private volatile boolean ready; // 신호용 volatile

    void write() {     // 스레드 A
        data = 42;     // (1)
        ready = true;  // (2) volatile 쓰기
    }

    void read() {      // 스레드 B
        if (ready) {             // (3) volatile 읽기
            System.out.println(data); // (4) 반드시 42
        }
    }
}
// (1) → (2) 프로그램 순서, (2) → (3) volatile 규칙, (3) → (4) 프로그램 순서
// 전이성으로 (1) → (4)가 성립한다`,
        warn: [
          'happens-before는 "실제로 먼저 실행됐다"는 시간 개념이 아니라 "결과가 보인다"는 보장이다.',
          '서로 다른 락이나 서로 다른 volatile 변수 사이에는 관계가 생기지 않는다. 같은 락, 같은 변수여야 한다.'
        ],
        qa: ['happens-before 관계를 예를 들어 설명해 주세요.', 'A가 B보다 happens-before이면 A가 한 쓰기를 B가 반드시 볼 수 있다는 보장입니다. 예를 들어 같은 락의 unlock은 이후 lock보다, volatile 변수 쓰기는 이후 읽기보다 happens-before입니다. 그래서 데이터를 준비한 뒤 volatile 플래그를 세우면, 플래그를 읽은 스레드는 전이성에 의해 준비된 데이터까지 볼 수 있습니다.'],
        rel: ['Java Memory Model', 'volatile', 'synchronized'] },
      { t: '가시성 문제', deep: false,
        d: '한 스레드가 공유 변수를 바꿨는데 다른 스레드가 바뀐 값을 보지 못하고 예전 값을 계속 읽는 문제다.',
        how: [
          '원인은 CPU마다 있는 캐시와 JIT 최적화다. 스레드는 값을 캐시나 레지스터에 두고 쓰기 때문에 메인 메모리에 반영되기 전까지 다른 코어는 알 수 없다.',
          'JIT는 반복문 안에서 바뀌지 않는다고 판단한 변수를 반복문 밖으로 끌어내기도 한다(hoisting). 그러면 다른 스레드가 값을 바꿔도 반복문이 끝나지 않는다.',
          '- 해결: `volatile`로 선언하거나, 읽기와 쓰기를 같은 락의 `synchronized` 안에서 하거나, `AtomicBoolean` 같은 클래스를 쓴다.',
          '- 원자성과는 별개 문제다. 가시성이 보장되어도 `count++` 같은 복합 연산은 여전히 경쟁 상태가 생긴다.'
        ],
        warn: ['디버거나 `System.out.println`을 넣으면 내부 동기화 때문에 문제가 사라져 보일 수 있다. 재현이 안 된다고 해결된 것이 아니다.'],
        rel: ['Java Memory Model', 'volatile', '경쟁 상태'] },
      { t: '명령어 재배치', deep: false,
        d: '컴파일러, JIT, CPU가 성능을 위해 단일 스레드 결과가 같다는 전제에서 명령어 실행 순서를 바꾸는 최적화다.',
        how: [
          '단일 스레드에서는 결과가 같으므로 문제가 없지만, 다른 스레드는 바뀐 순서를 관찰할 수 있다.',
          '대표 사례는 volatile 없는 더블 체크 락킹 싱글톤이다. `instance = new Singleton()`은 메모리 할당 → 생성자 실행 → 참조 대입 순서지만, 생성자 실행과 참조 대입이 바뀌면 다른 스레드가 초기화가 덜 된 객체를 받을 수 있다.',
          '- `volatile` 쓰기·읽기 앞뒤로는 재배치가 제한된다(메모리 배리어).',
          '- `synchronized` 블록 안팎으로 넘나드는 재배치도 제한된다.',
          '- 생성자에서 대입된 `final` 필드는 객체 참조가 공개된 뒤 다른 스레드에서 초기화된 값으로 보이도록 보장된다.'
        ],
        code: `class Singleton {
    private static volatile Singleton instance; // volatile 필수

    static Singleton getInstance() {
        if (instance == null) {
            synchronized (Singleton.class) {
                if (instance == null) {
                    instance = new Singleton();
                }
            }
        }
        return instance;
    }
}`,
        warn: ['싱글톤이 필요하면 더블 체크 락킹보다 홀더 클래스 방식이나 enum 싱글톤이 더 간단하고 안전하다.'],
        rel: ['Java Memory Model', 'volatile', '싱글톤 패턴'] }
    ]},
    { name: '락과 원자 연산', items: [
      { t: 'volatile', deep: true,
        d: '변수의 읽기와 쓰기를 항상 메인 메모리 기준으로 보이게 하고 앞뒤 재배치를 막아, 가시성과 순서를 보장하는 키워드다.',
        why: '스레드 사이에 상태 플래그나 한 번 설정되는 참조를 넘길 때, 락 없이 가볍게 가시성을 보장할 수 있다.',
        how: [
          '- 가시성: volatile 쓰기는 이후 같은 변수를 읽는 모든 스레드에게 보인다.',
          '- 순서: volatile 쓰기 이전의 쓰기는 그 뒤로 재배치되지 않고, volatile 읽기 이후의 읽기는 그 앞으로 재배치되지 않는다.',
          '- 원자성: 64비트 `long`, `double`의 읽기·쓰기도 원자적으로 만든다. 하지만 읽고-계산하고-쓰는 복합 연산은 원자적이지 않다.',
          '적합한 경우는 다음과 같다.',
          '1) 한 스레드만 쓰고 여러 스레드가 읽는 상태 플래그(`running`, `shutdownRequested`).',
          '2) 초기화를 마친 객체 참조를 안전하게 공개할 때(더블 체크 락킹).',
          '3) 값을 통째로 바꿔 끼우는 설정 객체 참조.',
          '여러 스레드가 동시에 값을 갱신해야 하면 `synchronized`나 Atomic 클래스를 써야 한다.'
        ],
        code: `class Counter {
    private volatile int count = 0;

    void increment() {
        count++;   // 위험: 읽기-더하기-쓰기 사이에 다른 스레드가 끼어든다
    }
}

class SafeCounter {
    private final AtomicInteger count = new AtomicInteger();

    void increment() {
        count.incrementAndGet(); // CAS로 원자적 증가
    }
}`,
        warn: [
          '`volatile int count`에 `count++`를 해도 증가가 유실된다. 가장 흔한 면접 함정이다.',
          'volatile은 락이 아니므로 "확인 후 실행(check-then-act)" 같은 여러 단계의 연산을 보호하지 못한다.'
        ],
        qa: ['volatile은 언제 쓰고, synchronized와 무엇이 다른가요?', 'volatile은 변수의 가시성과 재배치 방지를 보장하지만 원자성은 보장하지 않습니다. 그래서 한 스레드가 쓰고 여러 스레드가 읽는 상태 플래그나 참조 공개에 적합합니다. synchronized는 상호 배제로 원자성과 가시성을 모두 보장하므로 count++ 같은 복합 연산이나 여러 변수를 함께 바꿔야 할 때 씁니다.'],
        rel: ['가시성 문제', 'happens-before', 'synchronized', 'Atomic 클래스'] },
      { t: 'synchronized', deep: true,
        d: '객체마다 있는 모니터 락을 잡아 한 번에 한 스레드만 블록이나 메서드를 실행하게 하는 자바의 기본 동기화 키워드다.',
        why: '공유 상태를 여러 단계로 읽고 바꾸는 코드를 한 스레드씩 실행되게 해 경쟁 상태를 막고, 동시에 락 해제 시점의 변경이 다음 락 획득 스레드에 보이게 한다.',
        how: [
          '- 인스턴스 메서드에 붙이면 `this` 객체의 락을, static 메서드에 붙이면 `Class` 객체의 락을 잡는다.',
          '- `synchronized (lock) { ... }` 블록으로 필요한 구간만 좁게 잠그고 락 객체를 직접 지정할 수 있다.',
          '- 재진입 가능: 이미 락을 가진 스레드가 같은 락이 필요한 다른 메서드를 호출해도 막히지 않는다.',
          '- 예외가 나도 블록을 벗어나면 락이 자동으로 풀린다.',
          '- 락을 기다리는 스레드는 BLOCKED 상태가 되며, 기다림을 중단(interrupt)하거나 타임아웃을 줄 수 없다.',
          '- `wait()`/`notify()`/`notifyAll()`로 조건이 만족될 때까지 기다리고 깨울 수 있다. 반드시 같은 객체의 락을 잡은 상태에서 호출해야 한다.',
          'JVM은 경합이 없으면 가벼운 락, 경합이 생기면 무거운 OS 수준 락으로 바꾸는 최적화를 한다. Java 21 가상 스레드에서 synchronized 안의 블로킹은 캐리어 스레드를 묶는(pinning) 문제가 있었고 JDK 24에서 대부분 해결되었다.'
        ],
        code: `class BankAccount {
    private long balance;
    private final Object lock = new Object();

    void withdraw(long amount) {
        synchronized (lock) {           // 확인과 차감을 하나로 묶는다
            if (balance < amount) {
                throw new IllegalStateException("잔액 부족");
            }
            balance -= amount;
        }
    }
}`,
        warn: [
          '락 범위가 넓으면 처리량이 떨어진다. 외부 API 호출이나 I/O를 락 안에 두지 않는다.',
          '`String` 리터럴이나 박싱된 `Integer`를 락 객체로 쓰면 다른 코드와 우연히 같은 락을 공유할 수 있다. 전용 `private final Object`를 쓴다.',
          '서버가 여러 대면 synchronized는 각 JVM 안에서만 유효하다. 분산 환경의 동시성은 DB 락이나 분산 락이 필요하다.'
        ],
        qa: ['synchronized의 동작 원리와 한계를 설명해 주세요.', 'synchronized는 객체의 모니터 락을 획득한 스레드만 블록에 들어가게 해 원자성을 보장하고, 락 해제가 다음 획득보다 happens-before라서 가시성도 보장합니다. 재진입이 가능하고 예외가 나도 자동으로 해제됩니다. 다만 대기 중 인터럽트나 타임아웃이 안 되고 공정성을 고를 수 없으며, JVM 하나 안에서만 동작한다는 한계가 있어 필요하면 ReentrantLock이나 분산 락을 씁니다.'],
        rel: ['모니터', 'ReentrantLock', 'happens-before', '경쟁 상태'] },
      { t: 'ReentrantLock', deep: false,
        d: '`java.util.concurrent.locks`의 명시적 락으로, synchronized보다 세밀한 제어(타임아웃, 인터럽트, 공정성, 여러 조건)를 제공한다.',
        how: [
          '- `tryLock(timeout)`: 정해진 시간 안에 락을 못 얻으면 포기해 데드락을 피할 수 있다.',
          '- `lockInterruptibly()`: 락을 기다리는 중에 인터럽트로 빠져나올 수 있다.',
          '- 공정성: `new ReentrantLock(true)`면 오래 기다린 스레드부터 락을 얻는다. 처리량은 떨어진다.',
          '- `newCondition()`: 하나의 락에 여러 대기 조건(예: notFull, notEmpty)을 둘 수 있다.',
          '- synchronized처럼 재진입이 가능하고 happens-before도 보장한다.',
          '반드시 `try { ... } finally { lock.unlock(); }` 형태로 써야 한다. 해제를 빠뜨리면 영원히 락이 잡힌 상태가 된다.'
        ],
        code: `private final ReentrantLock lock = new ReentrantLock();

boolean transfer() throws InterruptedException {
    if (!lock.tryLock(1, TimeUnit.SECONDS)) {
        return false;            // 1초 안에 못 잡으면 포기
    }
    try {
        // 임계 구역
        return true;
    } finally {
        lock.unlock();
    }
}`,
        warn: ['특별한 기능이 필요 없으면 synchronized가 더 간단하고 실수가 적다.'],
        rel: ['synchronized', 'ReadWriteLock', '데드락'] },
      { t: 'ReadWriteLock', deep: false,
        d: '읽기 락은 여러 스레드가 동시에, 쓰기 락은 한 스레드만 잡을 수 있게 나눠 읽기가 많은 상황의 처리량을 높이는 락이다.',
        how: [
          '`ReentrantReadWriteLock`이 대표 구현이다. 쓰기 락을 가진 동안에는 읽기도 막히고, 읽기 락이 하나라도 있으면 쓰기는 기다린다.',
          '- 적합: 설정값, 캐시처럼 읽기가 쓰기보다 훨씬 많은 데이터.',
          '- 부적합: 쓰기가 잦거나 임계 구역이 매우 짧은 경우. 락 관리 비용이 더 크다.',
          '`StampedLock`은 락 없이 읽어 본 뒤 그사이 쓰기가 있었는지 확인하는 낙관적 읽기를 제공해 더 빠르지만, 재진입이 안 되고 사용이 까다롭다.'
        ],
        warn: ['읽기 락을 쥔 채 쓰기 락으로 올리려고 하면 데드락이 난다(락 업그레이드 불가).'],
        rel: ['ReentrantLock', 'CopyOnWriteArrayList'] },
      { t: 'Atomic 클래스', deep: false,
        d: '`AtomicInteger`, `AtomicLong`, `AtomicReference`처럼 CAS 연산으로 락 없이 단일 변수를 원자적으로 갱신하는 클래스들이다.',
        how: [
          '`incrementAndGet()`은 현재 값을 읽고, 기대값이 그대로일 때만 새 값으로 바꾸는 CAS를 성공할 때까지 반복한다. 스레드를 재우지 않아 경합이 적을 때 락보다 빠르다.',
          '- `compareAndSet(expect, update)`, `updateAndGet(fn)`, `accumulateAndGet(x, fn)`으로 복잡한 갱신도 원자적으로 할 수 있다.',
          '- 경합이 매우 심한 카운터는 `LongAdder`가 낫다. 내부적으로 여러 셀에 나눠 더하고 합계를 낼 때 모은다.',
          '- ABA 문제: 값이 A → B → A로 바뀌면 CAS는 변화를 눈치채지 못한다. 버전을 함께 비교하는 `AtomicStampedReference`로 해결한다.',
          '하나의 변수만 원자적으로 다룰 수 있다. 여러 변수를 함께 일관되게 바꿔야 하면 락이 필요하다.'
        ],
        code: `AtomicLong total = new AtomicLong();
total.addAndGet(500);

LongAdder hits = new LongAdder(); // 경합이 심한 조회수 카운터
hits.increment();
long sum = hits.sum();`,
        rel: ['CAS', 'volatile', 'ConcurrentHashMap'] }
    ]},
    { name: '스레드 풀', items: [
      { t: 'ExecutorService', deep: true,
        d: '작업(Runnable, Callable)을 제출하면 내부 스레드 풀이 실행해 주는 자바의 표준 작업 실행 프레임워크다.',
        why: '요청마다 `new Thread()`를 만들면 생성 비용이 크고 스레드 수가 무제한으로 늘어 메모리와 컨텍스트 스위칭 비용으로 서버가 무너진다. 스레드를 재사용하고 개수를 제한하려고 쓴다.',
        how: [
          '작업 제출과 실행을 분리한 것이 핵심이다. 호출하는 쪽은 "무엇을 할지"만 넘기고, 언제 어느 스레드에서 실행할지는 실행기가 정한다.',
          '- `execute(Runnable)`: 결과 없이 실행한다. 예외는 스레드의 UncaughtExceptionHandler로 간다.',
          '- `submit(Callable)`: `Future`를 돌려준다. 예외는 `Future.get()`을 호출할 때 `ExecutionException`으로 감싸져 나온다.',
          '- `invokeAll`, `invokeAny`: 여러 작업을 한꺼번에 제출한다.',
          '종료 절차:',
          '1) `shutdown()`: 새 작업을 받지 않고, 이미 받은 작업은 끝까지 실행한다.',
          '2) `awaitTermination(timeout)`: 정해진 시간 동안 종료를 기다린다.',
          '3) `shutdownNow()`: 실행 중인 작업에 인터럽트를 보내고, 대기 중인 작업 목록을 돌려준다.',
          'Java 19부터 ExecutorService는 AutoCloseable이라 try-with-resources로 쓰면 블록이 끝날 때 모든 작업 완료를 기다리고 닫힌다.'
        ],
        code: `try (ExecutorService pool = Executors.newFixedThreadPool(4)) {
    Future<Integer> f = pool.submit(() -> heavyCalc());
    pool.execute(() -> sendEmail());
    System.out.println(f.get(2, TimeUnit.SECONDS));
} // close(): 남은 작업을 기다린 뒤 종료

// Java 21: 작업마다 가상 스레드 하나
try (var vt = Executors.newVirtualThreadPerTaskExecutor()) {
    urls.forEach(u -> vt.submit(() -> fetch(u)));
}`,
        warn: [
          '스레드 풀을 종료하지 않으면 비데몬 스레드가 남아 JVM이 끝나지 않는다.',
          '`submit()`으로 제출하고 `Future`를 확인하지 않으면 작업 안의 예외가 조용히 사라진다.',
          '요청마다 새 스레드 풀을 만들지 않는다. 풀은 애플리케이션 단위로 만들어 재사용한다(스프링에서는 빈으로 등록).'
        ],
        qa: ['스레드를 직접 만들지 않고 ExecutorService를 쓰는 이유는?', '스레드 생성은 비용이 크고, 요청마다 만들면 스레드 수가 제한 없이 늘어 메모리와 컨텍스트 스위칭 비용으로 시스템이 무너집니다. ExecutorService는 정해진 수의 스레드를 재사용하고 작업 큐로 부하를 흡수하며, 작업 제출과 실행 정책을 분리해 줍니다. 또 Future로 결과와 예외를 받고, shutdown으로 안전하게 종료할 수 있습니다.'],
        rel: ['ThreadPoolExecutor 파라미터', 'Future', '스레드 풀 크기 산정', 'Java 21'] },
      { t: 'ThreadPoolExecutor 파라미터', deep: true,
        d: '스레드 풀의 실제 구현체로, 코어 스레드 수, 최대 스레드 수, 작업 큐, 유휴 시간, 거절 정책으로 동작 방식이 결정된다.',
        why: '풀이 언제 스레드를 늘리고 언제 작업을 거절하는지 정확히 알아야 트래픽 폭주 때 메모리 부족이나 요청 유실을 막을 수 있다. 면접에서 "작업이 들어오면 어떤 순서로 처리되나"를 자주 묻는다.',
        how: [
          '생성자 파라미터는 corePoolSize, maximumPoolSize, keepAliveTime, workQueue, threadFactory, handler(거절 정책)다.',
          '작업이 들어올 때 처리 순서:',
          '1) 실행 중인 스레드가 corePoolSize보다 적으면 새 스레드를 만들어 바로 실행한다.',
          '2) 코어가 모두 바쁘면 작업을 workQueue에 넣는다.',
          '3) 큐까지 가득 차면 maximumPoolSize까지 스레드를 추가로 만든다.',
          '4) 최대 스레드까지 모두 바쁘고 큐도 가득 차면 거절 정책을 실행한다.',
          '코어보다 많은 스레드는 keepAliveTime 동안 일이 없으면 종료된다.',
          '중요한 함정: 큐가 무제한(`LinkedBlockingQueue` 기본 생성)이면 3단계에 영원히 도달하지 않아 maximumPoolSize는 의미가 없고, 대신 큐에 작업이 끝없이 쌓여 메모리가 부족해진다.',
          'threadFactory로 스레드 이름(`order-worker-1`)을 지정해 두면 스레드 덤프와 로그 분석이 쉬워진다.'
        ],
        code: `ThreadPoolExecutor pool = new ThreadPoolExecutor(
    8,                                   // corePoolSize
    16,                                  // maximumPoolSize
    60, TimeUnit.SECONDS,                // 초과 스레드 유휴 시간
    new ArrayBlockingQueue<>(500),       // 크기가 정해진 큐
    Thread.ofPlatform().name("order-", 0).factory(),
    new ThreadPoolExecutor.CallerRunsPolicy() // 넘치면 호출 스레드가 실행
);`,
        warn: [
          '"코어가 차면 최대까지 스레드를 늘린다"고 답하는 것이 흔한 오답이다. 큐가 먼저 찬다.',
          '운영 환경에서는 크기가 정해진 큐와 명시적인 거절 정책을 쓰고, 큐 길이와 활성 스레드 수를 메트릭으로 감시한다.'
        ],
        qa: ['ThreadPoolExecutor에 작업이 들어오면 어떤 순서로 처리되나요?', '먼저 코어 스레드 수보다 적게 돌고 있으면 새 스레드를 만들어 실행합니다. 코어가 모두 바쁘면 작업 큐에 넣고, 큐가 가득 찼을 때 비로소 최대 스레드 수까지 스레드를 늘립니다. 그래도 넘치면 거절 정책이 실행됩니다. 그래서 무제한 큐를 쓰면 최대 스레드 설정이 무의미해지고 메모리 부족 위험이 생깁니다.'],
        rel: ['ExecutorService', '거절 정책', 'Executors 팩토리 함정', 'BlockingQueue'] },
      { t: '거절 정책', deep: false,
        d: '스레드 풀의 최대 스레드와 큐가 모두 가득 찼을 때 새 작업을 어떻게 처리할지 정하는 `RejectedExecutionHandler`다.',
        how: [
          '- AbortPolicy(기본): `RejectedExecutionException`을 던진다. 호출자가 실패를 알 수 있다.',
          '- CallerRunsPolicy: 작업을 제출한 스레드가 직접 실행한다. 제출 속도가 자연스럽게 느려져 백프레셔 효과가 있다. 다만 톰캣 요청 스레드가 실행하게 되면 응답이 느려진다.',
          '- DiscardPolicy: 아무 말 없이 버린다. 유실돼도 괜찮은 작업에만 쓴다.',
          '- DiscardOldestPolicy: 큐에서 가장 오래된 작업을 버리고 새 작업을 넣는다.',
          '직접 구현해 거절된 작업을 로그로 남기거나, 메시지 큐에 넣어 나중에 처리하게 할 수도 있다.'
        ],
        warn: ['Discard 계열은 장애가 조용히 묻힌다. 쓰더라도 거절 횟수를 메트릭으로 남긴다.'],
        rel: ['ThreadPoolExecutor 파라미터', 'Rate Limiting'] },
      { t: '스레드 풀 크기 산정', deep: false,
        d: '작업이 CPU를 쓰는지, I/O를 기다리는지에 따라 적절한 스레드 수를 추정하는 방법이다.',
        how: [
          '- CPU 바운드 작업(계산, 압축, 암호화): 코어 수 + 1 정도. 스레드가 더 많아도 코어를 나눠 쓸 뿐이라 컨텍스트 스위칭만 늘어난다.',
          '- I/O 바운드 작업(DB, 외부 API 호출): 스레드가 기다리는 동안 다른 스레드가 CPU를 쓸 수 있어 더 많이 둔다.',
          '브라이언 고츠의 공식: 스레드 수 ≈ 코어 수 × 목표 CPU 사용률 × (1 + 대기 시간 / 계산 시간). 대기가 계산의 9배라면 8코어에서 약 80개다.',
          '공식은 출발점일 뿐이며, 부하 테스트로 처리량과 지연 시간이 가장 좋은 지점을 찾는다.',
          '스레드를 늘려도 DB 커넥션 풀이 10개라면 나머지 스레드는 커넥션을 기다리기만 한다. 아래쪽 자원 크기와 함께 맞춘다.'
        ],
        warn: ['`Runtime.getRuntime().availableProcessors()`는 컨테이너의 CPU 제한을 반영한다(최신 JDK). 호스트 코어 수와 다를 수 있다.'],
        rel: ['ThreadPoolExecutor 파라미터', '컨텍스트 스위칭'] },
      { t: 'Executors 팩토리 함정', deep: false,
        d: '`Executors`의 편의 메서드가 만드는 스레드 풀은 큐나 스레드 수가 무제한이라 운영 환경에서 메모리 부족을 일으킬 수 있다.',
        how: [
          '- `newFixedThreadPool(n)`: 스레드는 n개로 고정되지만 큐가 무제한 `LinkedBlockingQueue`다. 처리보다 유입이 많으면 작업이 끝없이 쌓여 OOM이 난다.',
          '- `newSingleThreadExecutor()`: 위와 같은 문제가 있다.',
          '- `newCachedThreadPool()`: 큐 없이(SynchronousQueue) 스레드를 최대 `Integer.MAX_VALUE`까지 만든다. 폭주하면 스레드가 수천 개 생긴다.',
          '- `newScheduledThreadPool(n)`: 지연·주기 작업용. 작업 안에서 예외가 나면 이후 실행이 조용히 멈춘다.',
          '- `newVirtualThreadPerTaskExecutor()`(Java 21): 작업마다 가상 스레드를 만든다. 스레드 수 제한이 없으므로 DB 같은 한정 자원은 세마포어로 보호한다.',
          '알리바바 자바 코딩 가이드 등은 운영 코드에서 `ThreadPoolExecutor`를 직접 생성하라고 권한다.'
        ],
        rel: ['ThreadPoolExecutor 파라미터', 'Semaphore 클래스'] }
    ]},
    { name: '비동기 결과', items: [
      { t: 'Future', deep: false,
        d: '비동기 작업의 결과를 나중에 받기 위한 핸들로, 완료 여부 확인, 결과 조회, 취소 기능을 제공한다.',
        how: [
          '- `get()`: 결과가 나올 때까지 호출 스레드를 블로킹한다. `get(timeout, unit)`으로 최대 대기 시간을 줄 수 있다.',
          '- `isDone()`, `isCancelled()`: 상태를 확인한다.',
          '- `cancel(mayInterrupt)`: 작업을 취소한다. true면 실행 중인 스레드에 인터럽트를 보낸다.',
          '- 작업에서 난 예외는 `get()` 호출 시 `ExecutionException`으로 감싸져 나온다.',
          '한계: 결과를 받으려면 결국 블로킹해야 하고, "끝나면 다음 작업 실행" 같은 조합이나 여러 Future를 합치는 기능이 없다. 이 한계를 해결한 것이 CompletableFuture다.'
        ],
        warn: ['타임아웃 없는 `get()`은 작업이 멈추면 호출 스레드도 영원히 멈춘다.'],
        rel: ['ExecutorService', 'CompletableFuture'] },
      { t: 'CompletableFuture', deep: true,
        d: '비동기 작업의 결과를 콜백으로 이어 붙이고, 여러 작업을 조합하며, 예외를 처리할 수 있는 Java 8의 비동기 프로그래밍 도구다.',
        why: '상품 정보, 재고, 리뷰를 각각 다른 API에서 가져와 합쳐야 할 때 순서대로 호출하면 지연 시간이 더해진다. 동시에 호출하고 결과를 블로킹 없이 조합하려고 쓴다.',
        how: [
          '- 시작: `supplyAsync(supplier, executor)`(결과 있음), `runAsync(runnable, executor)`(결과 없음).',
          '- 변환: `thenApply(fn)`은 결과를 바꾸고, `thenAccept(consumer)`는 결과를 소비한다.',
          '- 이어 붙이기: `thenCompose(fn)`은 다음 비동기 작업을 연결한다(flatMap에 해당).',
          '- 합치기: `thenCombine(other, fn)`은 두 결과를 합치고, `allOf(...)`는 모두 끝날 때, `anyOf(...)`는 하나라도 끝날 때 완료된다.',
          '- 예외 처리: `exceptionally(fn)`으로 대체값을 주고, `handle((result, ex) -> ...)`으로 성공과 실패를 함께 처리한다.',
          '- 타임아웃: `orTimeout(1, SECONDS)`, `completeOnTimeout(default, 1, SECONDS)`(Java 9+).',
          'executor를 지정하지 않으면 공용 `ForkJoinPool.commonPool()`에서 실행된다. 이 풀은 CPU 코어 수 기준으로 작게 잡혀 있어 I/O 작업을 넣으면 다른 병렬 스트림까지 함께 막힌다.',
          '`...Async` 접미사가 붙은 메서드는 콜백을 다른 스레드에서 실행하고, 붙지 않은 메서드는 앞 작업을 완료한 스레드에서 실행한다.'
        ],
        code: `ExecutorService io = Executors.newFixedThreadPool(20);

CompletableFuture<Product> product = CompletableFuture.supplyAsync(() -> productApi.get(id), io);
CompletableFuture<Stock> stock = CompletableFuture.supplyAsync(() -> stockApi.get(id), io);

ProductView view = product
    .thenCombine(stock, ProductView::new)           // 두 결과 합치기
    .orTimeout(2, TimeUnit.SECONDS)                 // 전체 2초 제한
    .exceptionally(ex -> ProductView.fallback(id))  // 실패 시 대체 응답
    .join();`,
        warn: [
          'I/O 작업에는 반드시 전용 executor를 넘긴다. 공용 ForkJoinPool을 쓰면 서비스 전체가 느려질 수 있다.',
          '`join()`이나 `get()`을 체인 중간마다 부르면 결국 동기 코드와 다를 바가 없다.',
          '스프링의 트랜잭션, SecurityContext, MDC 로그 정보는 다른 스레드로 자동 전파되지 않는다.'
        ],
        qa: ['CompletableFuture를 쓸 때 주의할 점은 무엇인가요?', '가장 중요한 것은 실행 스레드 풀입니다. executor를 넘기지 않으면 공용 ForkJoinPool에서 실행되는데, 코어 수만큼 작게 잡혀 있어 I/O 작업이 몰리면 애플리케이션 전체의 병렬 처리가 막힙니다. 그래서 I/O용 전용 풀을 지정하고, orTimeout으로 시간 제한을 두고, exceptionally나 handle로 예외를 처리합니다. 또 스레드가 바뀌므로 트랜잭션이나 ThreadLocal 기반 정보가 전파되지 않는다는 점도 고려해야 합니다.'],
        rel: ['Future', 'ExecutorService', 'ThreadLocal 사용법'] }
    ]},
    { name: '동시성 컬렉션', items: [
      { t: 'ConcurrentHashMap', deep: true,
        d: '여러 스레드가 동시에 읽고 써도 안전하면서, 맵 전체를 잠그지 않아 높은 동시성을 내는 해시 맵이다.',
        why: '`HashMap`은 동시에 쓰면 데이터가 유실되거나 깨지고, `Collections.synchronizedMap`이나 `Hashtable`은 모든 연산이 하나의 락을 써서 느리다. 캐시나 카운터처럼 여러 스레드가 함께 쓰는 맵에 필요하다.',
        how: [
          'Java 8 이후 구조는 HashMap과 같은 버킷 배열이다.',
          '1) 읽기(`get`)는 락 없이 volatile 읽기로 처리한다.',
          '2) 빈 버킷에 넣을 때는 CAS로 첫 노드를 넣는다.',
          '3) 이미 노드가 있는 버킷에 넣을 때는 그 버킷의 첫 노드에만 `synchronized`를 건다. 서로 다른 버킷은 동시에 쓸 수 있다.',
          '4) 한 버킷의 노드가 8개를 넘으면(테이블 크기 64 이상일 때) 레드블랙 트리로 바꾼다.',
          '5) 크기를 늘릴 때는 여러 스레드가 나눠서 버킷을 옮긴다.',
          'Java 7까지는 맵을 16개 Segment로 나눠 Segment 단위로 락을 걸었다.',
          '- `null` 키와 값을 허용하지 않는다. `get`이 null을 돌려주면 "없음"인지 "null 값"인지 구분할 수 없기 때문이다.',
          '- `size()`는 LongAdder처럼 나눠 센 값을 합친 추정치라 동시 수정 중에는 정확하지 않을 수 있다.',
          '- 순회는 약한 일관성(weakly consistent)이라 ConcurrentModificationException이 나지 않지만 최신 변경이 보이지 않을 수 있다.'
        ],
        code: `ConcurrentHashMap<String, LongAdder> counts = new ConcurrentHashMap<>();

// 위험: 확인 후 넣기가 두 단계라 경쟁 상태
// if (!map.containsKey(k)) map.put(k, v);

// 안전: 원자적 복합 연산
counts.computeIfAbsent(word, k -> new LongAdder()).increment();
map.putIfAbsent(key, value);
map.merge(key, 1, Integer::sum);`,
        warn: [
          '개별 연산만 원자적이다. `containsKey` 후 `put`처럼 두 연산을 이어 쓰면 경쟁 상태가 생긴다. `computeIfAbsent`, `merge`, `putIfAbsent`를 쓴다.',
          '`computeIfAbsent` 안에서 같은 맵을 다시 수정하면 데드락이나 예외가 날 수 있다. 계산 함수는 짧고 단순하게 둔다.'
        ],
        qa: ['ConcurrentHashMap은 어떻게 동시성을 보장하나요?', 'Java 8 이후에는 맵 전체가 아니라 버킷 단위로 동기화합니다. 읽기는 락 없이 volatile로 처리하고, 빈 버킷에 넣을 때는 CAS를, 노드가 있는 버킷에 넣을 때는 그 버킷의 첫 노드에만 synchronized를 겁니다. 그래서 서로 다른 버킷은 동시에 수정할 수 있어 Hashtable보다 훨씬 동시성이 높습니다. 다만 개별 연산만 원자적이라 복합 연산은 computeIfAbsent나 merge를 써야 합니다.'],
        rel: ['해시 테이블', 'CAS', 'synchronized', 'Atomic 클래스'] },
      { t: 'CopyOnWriteArrayList', deep: false,
        d: '쓰기가 일어날 때마다 내부 배열 전체를 복사해 새 배열로 바꾸고, 읽기는 락 없이 하는 스레드 안전 리스트다.',
        how: [
          '- 읽기와 순회는 락 없이 그 순간의 배열 스냅샷을 본다. 순회 중 다른 스레드가 수정해도 ConcurrentModificationException이 나지 않는다.',
          '- 쓰기(add, remove)는 락을 잡고 배열을 통째로 복사한다. 원소가 많고 쓰기가 잦으면 매우 느리고 메모리를 많이 쓴다.',
          '- 적합: 이벤트 리스너 목록, 거의 바뀌지 않는 설정 목록처럼 읽기가 압도적으로 많은 경우.',
          '같은 원리의 Set 버전으로 `CopyOnWriteArraySet`이 있다.'
        ],
        rel: ['ReadWriteLock', 'ConcurrentHashMap'] },
      { t: 'BlockingQueue', deep: false,
        d: '큐가 비어 있으면 꺼내려는 스레드를, 가득 차 있으면 넣으려는 스레드를 기다리게 하는 스레드 안전 큐로, 생산자-소비자 패턴의 기본 도구다.',
        how: [
          '- `put()`/`take()`: 공간이나 원소가 생길 때까지 블로킹한다.',
          '- `offer(e, timeout)`/`poll(timeout)`: 정해진 시간만 기다린다.',
          '- `ArrayBlockingQueue`: 배열 기반, 크기 고정. 메모리를 예측할 수 있다.',
          '- `LinkedBlockingQueue`: 연결 리스트 기반. 크기를 주지 않으면 사실상 무제한이다.',
          '- `SynchronousQueue`: 저장 공간이 없어 넣는 쪽과 꺼내는 쪽이 직접 만나야 한다. `newCachedThreadPool`이 사용한다.',
          '- `PriorityBlockingQueue`, `DelayQueue`: 우선순위나 지연 시간 순서로 꺼낸다.',
          '스레드 풀의 작업 큐가 바로 BlockingQueue이며, 크기를 정해 두면 생산 속도를 소비 속도에 맞추는 백프레셔 역할을 한다.'
        ],
        rel: ['ThreadPoolExecutor 파라미터', '큐'] }
    ]},
    { name: '동기화 보조 도구', items: [
      { t: 'CountDownLatch', deep: false,
        d: '정해진 횟수만큼 `countDown()`이 호출될 때까지 `await()`한 스레드들을 기다리게 하는 일회용 동기화 도구다.',
        how: [
          '생성할 때 카운트를 정하고, 작업 스레드가 끝날 때마다 `countDown()`을 호출한다. 카운트가 0이 되면 `await()`로 기다리던 스레드가 모두 깨어난다.',
          '- 용도: 여러 초기화 작업이 모두 끝난 뒤 서비스를 시작할 때, 테스트에서 여러 스레드가 동시에 출발하게 할 때.',
          '- 한 번 0이 되면 다시 쓸 수 없다. 반복해서 쓰려면 CyclicBarrier를 쓴다.',
          '- `countDown()`은 반드시 finally에서 호출한다. 예외로 빠뜨리면 기다리는 스레드가 영원히 멈춘다.'
        ],
        code: `CountDownLatch latch = new CountDownLatch(3);
for (int i = 0; i < 3; i++) {
    pool.submit(() -> {
        try { loadCache(); } finally { latch.countDown(); }
    });
}
latch.await(10, TimeUnit.SECONDS); // 3개가 끝날 때까지(최대 10초) 대기`,
        rel: ['CyclicBarrier', 'Semaphore 클래스'] },
      { t: 'CyclicBarrier', deep: false,
        d: '정해진 수의 스레드가 모두 같은 지점(배리어)에 도착할 때까지 서로 기다렸다가 함께 다음 단계로 넘어가게 하는 재사용 가능한 도구다.',
        how: [
          '- 각 스레드가 `await()`를 호출하면 정해진 수가 모일 때까지 기다린다. 모두 모이면 함께 풀려나고 배리어가 초기화되어 다시 쓸 수 있다.',
          '- 생성자에 배리어 동작(Runnable)을 주면 모두 도착했을 때 한 번 실행된다(단계별 결과 합치기).',
          '- 기다리던 스레드 하나가 인터럽트되거나 타임아웃되면 배리어가 깨져 나머지도 `BrokenBarrierException`을 받는다.',
          'CountDownLatch는 "다른 작업들이 끝나기를 한쪽이 기다리는" 도구이고, CyclicBarrier는 "같은 스레드들이 서로를 기다리는" 도구라는 점이 다르다.'
        ],
        rel: ['CountDownLatch'] },
      { t: 'Semaphore 클래스', deep: false,
        d: '`java.util.concurrent.Semaphore`는 허가(permit) 개수만큼만 동시에 실행되도록 제한하는 도구다.',
        how: [
          '- `acquire()`로 허가를 하나 얻고, 다 쓰면 `release()`로 돌려준다. 허가가 없으면 생길 때까지 기다린다.',
          '- `tryAcquire(timeout)`으로 정해진 시간만 기다릴 수 있다.',
          '- 용도: 외부 API 동시 호출 수 제한, DB 같은 한정 자원 보호, 가상 스레드 환경에서 동시 실행 수 제한.',
          '- 공정성 옵션(`new Semaphore(n, true)`)으로 오래 기다린 스레드부터 허가를 받게 할 수 있다.',
          '락과 달리 소유권이 없어 다른 스레드가 release할 수 있으므로, 획득한 쪽이 finally에서 반드시 돌려주도록 규칙을 지킨다.'
        ],
        code: `private final Semaphore limit = new Semaphore(10); // 동시 10개

Response call() throws InterruptedException {
    limit.acquire();
    try {
        return externalApi.request();
    } finally {
        limit.release();
    }
}`,
        rel: ['세마포어', 'Executors 팩토리 함정'] }
    ]},
    { name: '스레드 안전 설계', items: [
      { t: '불변 객체와 스레드 안전', deep: false,
        d: '생성된 뒤 상태가 바뀌지 않는 객체는 동기화 없이 여러 스레드가 공유해도 항상 안전하다.',
        how: [
          '불변 객체를 만드는 규칙:',
          '- 클래스를 `final`로 선언하거나 생성자를 숨겨 상속으로 상태가 바뀌지 않게 한다.',
          '- 모든 필드를 `private final`로 둔다.',
          '- setter를 두지 않는다. 값을 바꾸려면 새 객체를 돌려준다(`withPrice()`).',
          '- 가변 객체(List, Date)를 받거나 돌려줄 때는 방어적 복사를 하거나 `List.copyOf`로 불변 컬렉션을 쓴다.',
          '`final` 필드는 생성자가 끝난 뒤 다른 스레드에서도 초기화된 값으로 보인다는 JMM 보장이 있다. 단, 생성자 안에서 `this`를 밖으로 넘기면 이 보장이 깨진다.',
          'Java의 `String`, `Integer`, `LocalDateTime`, `record`(얕은 불변) 등이 대표적인 불변 타입이다.'
        ],
        warn: ['record의 필드가 `List` 같은 가변 객체면 그 내용은 바뀔 수 있다. 생성자에서 `List.copyOf`로 감싼다.'],
        rel: ['String 불변성', 'Java Memory Model'] },
      { t: 'ThreadLocal 사용법', deep: false,
        d: '같은 변수를 스레드마다 독립된 값으로 갖게 해, 파라미터로 넘기지 않고도 한 요청 흐름 안에서 값을 공유하는 도구다.',
        how: [
          '- 스프링의 트랜잭션 동기화, SecurityContextHolder, 로그 MDC가 ThreadLocal로 구현되어 있다.',
          '- `set()`, `get()`, `remove()`로 쓰며, 값은 각 스레드 객체 안의 맵에 저장된다.',
          '- 스레드 풀은 스레드를 재사용하므로 요청이 끝나면 반드시 `remove()`해야 한다. 지우지 않으면 다음 요청이 이전 사용자의 값을 보고, 값이 계속 남아 메모리 누수가 된다.',
          '- 새로 만든 스레드나 다른 풀의 스레드에는 값이 전달되지 않는다. `InheritableThreadLocal`은 자식 스레드 생성 시점에만 복사하므로 스레드 풀과 함께 쓰면 엉뚱한 값이 남는다.',
          '- 가상 스레드는 수백만 개가 생길 수 있어 ThreadLocal에 큰 객체를 두면 메모리가 크게 늘어난다. Java 25에서 정식이 된 `ScopedValue`는 범위가 정해진 불변 값을 안전하게 공유하는 대안이다.'
        ],
        code: `private static final ThreadLocal<String> TRACE_ID = new ThreadLocal<>();

void handle(Request req) {
    TRACE_ID.set(req.header("X-Trace-Id"));
    try {
        service.process();
    } finally {
        TRACE_ID.remove();   // 스레드 재사용 대비 필수
    }
}`,
        rel: ['CompletableFuture', 'Java 21', 'Java 25'] }
    ]}
  ],
  must: [
    '`volatile`은 가시성만 보장한다. `count++` 같은 복합 연산은 `AtomicInteger`나 락으로 보호한다.',
    '`Executors.newFixedThreadPool`은 큐가 무제한이다. 운영에서는 크기가 정해진 큐와 거절 정책을 둔 `ThreadPoolExecutor`를 직접 만든다.',
    'ThreadPoolExecutor는 코어 → 큐 → 최대 스레드 → 거절 순서로 동작한다. 큐가 무제한이면 최대 스레드는 의미가 없다.',
    '`CompletableFuture`에 executor를 넘기지 않으면 공용 ForkJoinPool을 쓴다. I/O 작업은 전용 풀을 지정한다.',
    '`ConcurrentHashMap`도 확인 후 넣기는 원자적이지 않다. `computeIfAbsent`, `merge`, `putIfAbsent`를 쓴다.'
  ]
};
