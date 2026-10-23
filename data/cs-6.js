(window.MINDMAP = window.MINDMAP || {})['cs-6'] = {
  name: '자바 · JVM',
  groups: [
    { name: 'JVM 메모리 구조', items: [
      { t: 'JVM 힙', deep: true,
        d: '`new`로 만든 모든 객체와 배열이 저장되는, 모든 스레드가 공유하는 메모리 영역이다.',
        why: '객체는 메서드 호출이 끝나도 계속 쓰일 수 있으므로 호출 단위로 사라지는 스택이 아닌 별도 공간이 필요하다. 힙은 GC가 자동으로 정리해 개발자가 메모리를 직접 해제하지 않아도 된다.',
        how: [
          '자바 소스는 javac로 바이트코드(.class)가 되고, 클래스 로더가 클래스를 올린 뒤 실행 엔진(인터프리터 + JIT)이 실행한다. 실행 중 데이터는 런타임 데이터 영역에 저장되며, 힙은 그중 가장 큰 영역이다.',
          '1) `new Order()`를 실행하면 힙에 객체가 할당되고, 지역 변수에는 그 객체를 가리키는 참조값만 저장된다.',
          '2) 새 객체는 대부분 Young 영역의 Eden에 생기고, GC에서 살아남을수록 Survivor를 거쳐 Old 영역으로 옮겨진다.',
          '3) 더 이상 어떤 참조도 닿지 않는 객체는 GC가 회수한다.',
          '- 크기 설정: `-Xms`(시작 크기), `-Xmx`(최대 크기). 컨테이너 환경에서는 `-XX:MaxRAMPercentage`로 메모리 비율을 지정하기도 한다.',
          '- 공유 영역: 모든 스레드가 같은 힙을 보므로, 여러 스레드가 같은 객체를 바꾸면 동기화가 필요하다.',
          '- 부족하면 `OutOfMemoryError: Java heap space`가 발생한다.'
        ],
        code: `public void order() {
    int count = 3;                 // 기본형 지역 변수: 스택에 값 저장
    Order order = new Order();     // Order 객체: 힙에 저장
                                   // order 변수(참조값): 스택에 저장
    order.addItem("book", count);
}   // 메서드가 끝나면 스택 프레임은 사라지고,
    // 힙의 Order 객체는 참조가 없어지면 GC 대상이 된다`,
        warn: [
          'static 컬렉션에 객체를 계속 쌓으면 GC 루트에서 계속 닿으므로 회수되지 않아 메모리 누수가 된다.',
          '`-Xmx`를 너무 크게 잡으면 Full GC 한 번의 정지 시간이 길어질 수 있다.',
          'OOM이 나면 `-XX:+HeapDumpOnOutOfMemoryError`로 힙 덤프를 남겨 원인 객체를 분석한다.'
        ],
        qa: ['힙과 스택의 차이를 설명해 주세요.', '힙은 new로 만든 객체가 저장되고 모든 스레드가 공유하며 GC가 관리합니다. 스택은 스레드마다 따로 있고 메서드 호출마다 프레임이 쌓였다가 메서드가 끝나면 사라지며, 지역 변수와 객체 참조값이 저장됩니다. 그래서 지역 변수는 스레드 안전하지만 힙의 공유 객체는 동기화가 필요합니다.'],
        rel: ['JVM 스택', 'GC 동작 원리', '세대별 GC'] },
      { t: 'JVM 스택', deep: true,
        d: '스레드마다 하나씩 만들어져, 메서드 호출 정보(스택 프레임)를 쌓아 두는 메모리 영역이다.',
        why: '메서드 호출과 반환은 항상 나중에 호출된 것이 먼저 끝나는 LIFO 구조라서 스택으로 관리하면 빠르고 단순하다. 스레드마다 따로 있어 지역 변수는 다른 스레드와 섞이지 않는다.',
        how: [
          '1) 메서드가 호출되면 새 스택 프레임이 스택 맨 위에 쌓인다.',
          '2) 프레임에는 지역 변수 배열(매개변수 포함), 연산 중간값을 담는 피연산자 스택, 반환 주소 등이 들어간다.',
          '3) 메서드가 끝나면 프레임이 통째로 제거되어 별도 정리 비용이 없다.',
          '- 기본형 지역 변수(int, long 등)는 값 자체가, 객체 지역 변수는 힙 객체의 참조값이 저장된다.',
          '- 스택 크기는 `-Xss`로 정한다(보통 기본 512KB~1MB).',
          '- 가상 스레드의 스택은 힙에 작은 조각으로 저장되어 필요한 만큼만 커진다. 그래서 수백만 개를 만들 수 있다.'
        ],
        code: `int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1); // 호출마다 프레임이 하나씩 쌓인다
}

factorial(5);       // 프레임 5개 → 차례로 반환하며 제거
factorial(1_000_000); // 프레임이 너무 많아 StackOverflowError`,
        warn: [
          '재귀 깊이가 너무 깊으면 `StackOverflowError`가 난다. 반복문이나 명시적 스택으로 바꾼다.',
          '지역 변수는 스레드 안전하지만, 지역 변수가 가리키는 힙 객체를 다른 스레드와 공유하면 안전하지 않다.'
        ],
        qa: ['StackOverflowError는 언제 발생하나요?', '스레드의 스택 공간보다 많은 스택 프레임이 쌓일 때 발생합니다. 주로 종료 조건이 잘못된 재귀나 너무 깊은 재귀 호출이 원인입니다. 재귀를 반복문으로 바꾸거나 꼬리 재귀 형태로 바꾸고, 꼭 필요하면 -Xss로 스택 크기를 늘립니다.'],
        rel: ['JVM 힙', 'PC 레지스터 · 네이티브 스택'] },
      { t: '메서드 영역 · Metaspace', deep: false,
        d: '클래스 구조, 메서드 바이트코드, static 변수, 런타임 상수 풀처럼 클래스 단위 정보를 저장하는 공유 영역이다.',
        how: [
          '클래스 로더가 클래스를 처음 로드할 때 그 클래스의 필드·메서드 정보와 바이트코드가 이곳에 올라간다.',
          '- Java 7까지는 힙의 일부인 PermGen에 있었고 크기가 고정되어 `OutOfMemoryError: PermGen space`가 자주 났다.',
          '- Java 8부터는 네이티브 메모리를 쓰는 Metaspace로 바뀌어 필요한 만큼 늘어난다. 상한은 `-XX:MaxMetaspaceSize`로 정한다.',
          '- String Pool과 static 변수가 가리키는 객체 자체는 힙에 있다.'
        ],
        warn: ['클래스를 동적으로 계속 만드는 코드(프록시, 스크립트 엔진)나 클래스 로더 누수가 있으면 Metaspace OOM이 날 수 있다.'],
        rel: ['JVM 힙', '클래스 로딩 · JIT'] },
      { t: 'PC 레지스터 · 네이티브 스택', deep: false,
        d: '스레드마다 따로 있는 작은 영역으로, PC 레지스터는 현재 실행 중인 명령어 위치를, 네이티브 스택은 네이티브 코드 호출 정보를 담는다.',
        how: [
          '- PC 레지스터: 스레드가 지금 어느 바이트코드 명령어를 실행하는지 가리킨다. 컨텍스트 스위칭 후 이어서 실행할 위치를 알기 위해 필요하다.',
          '- 네이티브 메서드 스택: JNI로 C/C++ 같은 네이티브 메서드를 호출할 때 쓰인다.',
          '두 영역 모두 스레드 생성 시 만들어지고 스레드가 끝나면 사라진다.'
        ],
        rel: ['JVM 스택'] },
      { t: '클래스 로딩 · JIT', deep: false,
        d: '클래스 로더가 필요한 시점에 클래스를 메모리에 올리고, JIT 컴파일러가 자주 실행되는 코드를 기계어로 바꿔 빠르게 실행하는 구조다.',
        how: [
          '1) 로딩: 클래스가 처음 쓰일 때 .class 파일을 읽는다. 부모 클래스 로더에게 먼저 맡기는 부모 위임 모델로 같은 클래스가 중복 로드되는 것을 막는다.',
          '2) 링킹: 바이트코드를 검증하고 static 변수 공간을 준비한다.',
          '3) 초기화: static 블록과 static 변수 초기값을 실행한다.',
          'JIT은 처음에는 인터프리터로 실행하다가 자주 호출되는 메서드(핫스팟)를 기계어로 컴파일해 캐시한다. 그래서 자바 애플리케이션은 기동 직후보다 조금 지나야 최고 성능이 난다(워밍업).'
        ],
        rel: ['메서드 영역 · Metaspace'] }
    ]},
    { name: '가비지 컬렉션', items: [
      { t: 'GC 동작 원리', deep: true,
        d: '더 이상 참조되지 않는 객체를 찾아 힙 메모리를 자동으로 회수하는 JVM의 기능이다.',
        why: '개발자가 메모리를 직접 해제하면 해제를 잊는 누수나 이미 해제한 메모리를 쓰는 버그가 생긴다. GC는 이를 자동으로 처리해 안전성과 생산성을 높인다.',
        how: [
          'GC는 "살아 있는 객체"를 찾아 남기고 나머지를 버린다. 살아 있다는 기준은 GC 루트에서 참조를 따라 닿을 수 있는가(Reachability)다.',
          '- GC 루트: 실행 중인 스택 프레임의 지역 변수, static 변수, JNI 참조, 활성 스레드 등.',
          '1) Mark: GC 루트에서 시작해 참조를 따라가며 닿는 객체에 표시한다.',
          '2) Sweep: 표시되지 않은 객체의 메모리를 회수한다.',
          '3) Compact: 살아남은 객체를 한쪽으로 모아 메모리 단편화를 없앤다(컬렉터에 따라 다르다).',
          '서로만 참조하는 순환 참조 객체도 루트에서 닿지 않으면 회수된다. 참조 카운팅 방식이 아니기 때문이다.',
          'GC가 일하는 동안 애플리케이션 스레드가 멈추는 Stop-the-World가 생기며, GC 종류와 튜닝은 대부분 이 정지 시간을 줄이는 것이 목표다.'
        ],
        code: `void example() {
    Order a = new Order();   // 루트(지역 변수 a)에서 닿음 → 살아 있음
    a = new Order();         // 처음 만든 Order는 이제 아무도 참조하지 않음 → GC 대상

    Node x = new Node();
    Node y = new Node();
    x.next = y; y.next = x;  // 순환 참조
    x = null; y = null;      // 루트에서 닿지 않으므로 둘 다 회수된다
}`,
        warn: [
          '`System.gc()`는 GC를 요청할 뿐 실행을 보장하지 않으며, Full GC를 유발할 수 있어 운영 코드에서 호출하지 않는다.',
          'GC가 있어도 static 컬렉션, 캐시, ThreadLocal처럼 루트에서 계속 닿는 참조를 남기면 메모리 누수가 생긴다.',
          '`finalize()`는 Java 9부터 deprecated다. 자원 정리는 try-with-resources를 쓴다.'
        ],
        qa: ['GC는 어떤 객체를 회수하나요?', 'GC 루트, 즉 스택의 지역 변수나 static 변수 등에서 참조를 따라가 닿을 수 없는 객체를 회수합니다. Mark 단계에서 닿는 객체를 표시하고 Sweep 단계에서 나머지를 회수하며, 필요하면 Compact로 단편화를 정리합니다. 순환 참조여도 루트에서 닿지 않으면 회수됩니다.'],
        rel: ['세대별 GC', 'Stop-the-World', 'JVM 힙'] },
      { t: '세대별 GC', deep: false,
        d: '"대부분의 객체는 금방 쓰레기가 된다"는 가설에 따라 힙을 Young과 Old 영역으로 나누어 관리하는 방식이다.',
        how: [
          '- Young 영역: 새 객체가 Eden에 생긴다. Eden이 가득 차면 Minor GC가 일어나 살아남은 객체를 Survivor 영역(S0, S1 중 하나)으로 옮긴다. 두 Survivor는 번갈아 쓰인다.',
          '- 승격: Minor GC에서 여러 번(age 임계값) 살아남은 객체는 Old 영역으로 옮겨진다.',
          '- Old 영역: 오래 사는 객체가 모인다. 가득 차면 Major GC 또는 Full GC가 일어나며 시간이 오래 걸린다.',
          'Young 영역은 대부분 죽은 객체라 살아남은 소수만 복사하면 되어 Minor GC가 매우 빠르다. 영역을 나누면 매번 힙 전체를 검사하지 않아도 된다.'
        ],
        warn: ['큰 객체나 오래 들고 있는 캐시가 많으면 Old 영역이 빨리 차서 Full GC가 잦아진다.'],
        rel: ['GC 동작 원리', 'G1 GC'] },
      { t: 'Stop-the-World', deep: false,
        d: 'GC를 실행하기 위해 GC 스레드를 제외한 모든 애플리케이션 스레드가 멈추는 현상이다.',
        how: [
          '객체 참조 관계가 바뀌는 도중에 살아 있는 객체를 판단하면 잘못 회수할 수 있으므로, GC는 일부 단계에서 애플리케이션을 멈춘다.',
          '- 영향: 정지 시간 동안 요청이 처리되지 않아 응답 지연(레이턴시 튀는 현상)이 생긴다.',
          '- 확인: GC 로그(`-Xlog:gc*`)나 Actuator·Micrometer의 GC pause 메트릭으로 정지 시간을 본다.',
          'G1, ZGC 같은 최신 컬렉터는 대부분의 작업을 애플리케이션과 동시에 수행해 정지 시간을 줄인다.'
        ],
        rel: ['GC 동작 원리', 'ZGC'] },
      { t: 'G1 GC', deep: false,
        d: '힙을 같은 크기의 Region으로 나누고 쓰레기가 많은 Region부터 회수하는 GC로, Java 9부터 기본 컬렉터다.',
        how: [
          '- Region: 힙을 1~32MB 크기의 Region 수천 개로 나누고, 각 Region이 Eden, Survivor, Old, Humongous(아주 큰 객체) 역할을 맡는다.',
          '- Garbage First: 회수할 쓰레기가 가장 많은 Region부터 처리해 적은 시간에 많은 메모리를 확보한다.',
          '- 목표 정지 시간: `-XX:MaxGCPauseMillis`(기본 200ms)를 맞추도록 한 번에 처리할 Region 수를 조절한다.',
          '처리량과 정지 시간의 균형이 좋아 일반적인 서버 애플리케이션에 무난하다.'
        ],
        rel: ['세대별 GC', 'ZGC'] },
      { t: 'ZGC', deep: false,
        d: '대부분의 GC 작업을 애플리케이션 실행과 동시에 수행해, 힙이 커도 정지 시간을 1ms 안팎으로 유지하는 저지연 GC다.',
        how: [
          '- 컬러드 포인터와 로드 배리어로 객체를 옮기는 작업까지 애플리케이션 스레드와 동시에 처리한다.',
          '- 수백 MB부터 수 TB 힙까지 정지 시간이 힙 크기에 거의 비례하지 않는다.',
          '- Java 15에서 정식 기능이 되었고, Java 21에서 세대별 ZGC가 추가되었으며 이후 버전에서 세대별 모드가 기본이 되었다.',
          '- `-XX:+UseZGC`로 켠다. 비슷한 목표의 컬렉터로 Shenandoah가 있다.'
        ],
        warn: ['정지 시간을 줄이는 대신 CPU와 메모리를 조금 더 쓰므로 처리량이 중요한 배치 작업에는 Parallel GC가 나을 수 있다.'],
        rel: ['G1 GC', 'Stop-the-World'] }
    ]},
    { name: '객체 비교', items: [
      { t: 'equals', deep: true,
        d: '두 객체의 내용(논리적 값)이 같은지 비교하는 `Object`의 메서드로, 기본 구현은 참조 비교(`==`)와 같다.',
        why: '값 객체, DTO, 맵의 키처럼 "같은 값이면 같은 것"으로 취급해야 하는 객체는 인스턴스가 달라도 같다고 판단해야 한다. 컬렉션의 `contains`, `remove`, `indexOf`도 모두 equals로 비교한다.',
        how: [
          '`==`는 두 변수가 같은 인스턴스를 가리키는지(참조) 비교하고, `equals`는 재정의하면 값이 같은지 비교한다.',
          '재정의할 때 지켜야 하는 규약:',
          '- 반사성: `x.equals(x)`는 true.',
          '- 대칭성: `x.equals(y)`가 true면 `y.equals(x)`도 true.',
          '- 추이성: x=y이고 y=z면 x=z.',
          '- 일관성: 값이 바뀌지 않으면 여러 번 호출해도 결과가 같다.',
          '- null 비교: `x.equals(null)`은 false.',
          'equals를 재정의하면 반드시 hashCode도 함께 재정의해야 한다.'
        ],
        code: `public final class Money {
    private final long amount;
    private final String currency;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Money other)) return false;
        return amount == other.amount && currency.equals(other.currency);
    }

    @Override
    public int hashCode() {
        return Objects.hash(amount, currency);
    }
}
// record Money(long amount, String currency) {} 로 쓰면 자동 생성된다`,
        warn: [
          'Integer는 -128~127만 캐시되어 그 범위 밖에서 `==`로 비교하면 값이 같아도 false가 된다. 래퍼 타입은 equals로 비교한다.',
          '상속 관계에서 하위 클래스가 필드를 추가하면 대칭성과 추이성을 지키기 어렵다. 값 클래스는 final로 만들거나 record를 쓴다.',
          'JPA 엔티티는 프록시 객체일 수 있어 `getClass()` 비교 대신 `instanceof`와 getter를 쓴다.'
        ],
        qa: ['==와 equals의 차이는 무엇인가요?', '==는 두 참조가 같은 인스턴스를 가리키는지 비교하고, equals는 객체의 논리적 값이 같은지 비교하도록 재정의하는 메서드입니다. Object의 기본 equals는 ==와 같아서, 값 비교가 필요한 클래스는 equals를 재정의해야 하고 이때 hashCode도 함께 재정의해야 합니다.'],
        rel: ['hashCode', 'String 불변성'] },
      { t: 'hashCode', deep: true,
        d: '객체를 해시 기반 컬렉션에 저장할 때 쓰는 정수값을 반환하는 메서드로, equals가 같은 객체는 반드시 같은 값을 반환해야 한다.',
        why: 'HashMap과 HashSet은 hashCode로 버킷을 먼저 찾고, 그 버킷 안에서만 equals로 비교한다. hashCode가 일관되지 않으면 같은 값의 객체를 찾지 못한다.',
        how: [
          '규약:',
          '- equals가 true인 두 객체는 반드시 같은 hashCode를 반환한다.',
          '- hashCode가 같다고 equals가 true일 필요는 없다(해시 충돌).',
          '- 객체가 바뀌지 않으면 여러 번 호출해도 같은 값을 반환한다.',
          'HashSet에서 `contains(x)`가 동작하는 순서:',
          '1) `x.hashCode()`로 버킷 위치를 계산한다.',
          '2) 그 버킷에 있는 원소들과 `equals`로 비교한다.',
          'equals만 재정의하고 hashCode를 그대로 두면 값이 같은 두 객체가 서로 다른 버킷에 들어가, 중복 제거가 안 되고 `contains`가 false를 반환한다.'
        ],
        code: `class Point {
    final int x, y;
    Point(int x, int y) { this.x = x; this.y = y; }

    @Override public boolean equals(Object o) {
        return o instanceof Point p && x == p.x && y == p.y;
    }
    // hashCode를 재정의하지 않으면:
    // set.add(new Point(1, 2));
    // set.contains(new Point(1, 2)) → false
    @Override public int hashCode() { return Objects.hash(x, y); }
}`,
        warn: [
          'hashCode에 쓰는 필드가 바뀌면 HashSet에 넣은 객체를 다시 찾을 수 없다. 불변 필드로 계산한다.',
          '모든 객체에 같은 값을 반환해도 규약은 지키지만, 모두 한 버킷에 몰려 조회가 O(n)으로 느려진다.',
          'IDE 생성, `Objects.hash()`, Lombok `@EqualsAndHashCode`, record를 쓰면 실수를 줄인다.'
        ],
        qa: ['equals와 hashCode를 함께 재정의해야 하는 이유는?', 'HashMap이나 HashSet은 hashCode로 버킷을 찾은 뒤 equals로 비교합니다. equals만 재정의하면 값이 같은 두 객체의 hashCode가 달라 서로 다른 버킷에 저장되므로, 같은 키로 값을 찾지 못하거나 중복이 제거되지 않습니다. 그래서 equals가 같으면 hashCode도 같아야 한다는 규약을 지켜야 합니다.'],
        rel: ['equals'] }
    ]},
    { name: '문자열', items: [
      { t: 'String 불변성', deep: false,
        d: 'String 객체는 한 번 만들어지면 내용을 바꿀 수 없으며, 바꾸는 것처럼 보이는 연산은 모두 새 객체를 만든다.',
        how: [
          '`s.toUpperCase()`, `s + "a"`, `s.replace(...)`는 기존 문자열을 그대로 두고 새 String을 반환한다.',
          '- 해시 캐싱: hashCode를 한 번 계산해 저장해 두므로 HashMap의 키로 빠르게 쓰인다.',
          '- 보안: 파일 경로, DB URL, 클래스 이름 같은 값이 검증 후에 바뀌는 것을 막는다.',
          '- 스레드 안전: 바뀌지 않으므로 동기화 없이 여러 스레드가 공유할 수 있다.',
          '- 공유 가능: 불변이라서 String Pool로 같은 문자열을 공유할 수 있다.'
        ],
        warn: ['비밀번호처럼 민감한 값은 String으로 두면 GC 전까지 메모리에 남으므로, 보안이 중요한 API는 `char[]`로 받아 사용 후 지운다.'],
        rel: ['String Pool', 'StringBuilder'] },
      { t: 'String Pool', deep: false,
        d: '문자열 리터럴을 힙의 특별한 영역에 하나만 저장해 같은 값을 여러 변수가 공유하게 하는 저장소다.',
        how: [
          '`String a = "hello"; String b = "hello";`면 a와 b는 같은 객체를 가리켜 `a == b`가 true다.',
          '`new String("hello")`는 풀을 쓰지 않고 힙에 새 객체를 만들어 `==` 비교가 false가 된다.',
          '`intern()`을 호출하면 풀에 있는 같은 값의 객체를 돌려받는다.',
          'Java 7부터 String Pool은 PermGen이 아닌 힙에 있어 GC 대상이 된다.'
        ],
        warn: ['문자열 비교는 풀 여부와 상관없이 항상 `equals`로 한다.'],
        rel: ['String 불변성'] },
      { t: 'StringBuilder', deep: false,
        d: '내부 버퍼를 직접 수정하는 가변 문자열 클래스로, 문자열을 반복해서 이어 붙일 때 쓴다.',
        how: [
          '반복문 안에서 `result += s`를 하면 매번 새 String이 생겨 O(n²)에 가까운 복사가 일어난다. StringBuilder는 하나의 버퍼에 추가하므로 훨씬 빠르다.',
          '- `StringBuilder`: 동기화가 없어 빠르다. 대부분 이것을 쓴다.',
          '- `StringBuffer`: 모든 메서드가 synchronized다. 여러 스레드가 같은 버퍼를 공유할 때만 쓴다.',
          '한 줄짜리 단순 연결(`"a" + b + "c"`)은 컴파일러가 알아서 최적화하므로 굳이 바꿀 필요가 없다.'
        ],
        rel: ['String 불변성'] }
    ]},
    { name: '예외', items: [
      { t: '체크 예외', deep: false,
        d: '`Exception`을 상속하지만 `RuntimeException`은 아닌 예외로, 컴파일러가 처리(catch 또는 throws)를 강제한다.',
        how: [
          '대표 예: `IOException`, `SQLException`, `InterruptedException`.',
          '호출자가 복구할 수 있는 상황을 알리려는 의도로 설계되었다.',
          '- 문제점: 실제로는 복구할 방법이 없는 경우가 많아 모든 계층에 `throws`가 퍼지고, 의미 없는 catch로 예외를 삼키는 코드가 생긴다.',
          '- 기술 종속: `throws SQLException`이 서비스까지 올라오면 서비스가 JDBC에 묶인다.'
        ],
        warn: ['catch한 뒤 아무것도 하지 않고 삼키지 않는다. 최소한 로그를 남기거나 언체크 예외로 감싸 다시 던진다.'],
        rel: ['언체크 예외', '예외 전환'] },
      { t: '언체크 예외', deep: false,
        d: '`RuntimeException`을 상속한 예외로, 컴파일러가 처리를 강제하지 않는다.',
        how: [
          '대표 예: `NullPointerException`, `IllegalArgumentException`, `IllegalStateException`, `IndexOutOfBoundsException`.',
          '주로 프로그래밍 오류나 복구할 수 없는 상황을 나타낸다.',
          '최근 실무와 스프링은 언체크 예외를 기본으로 쓴다. 스프링 트랜잭션도 기본적으로 언체크 예외에서만 롤백한다.',
          '`Error`(OutOfMemoryError 등)는 예외가 아닌 시스템 오류로, 애플리케이션이 잡지 않는다.'
        ],
        rel: ['체크 예외', '예외 전환'] },
      { t: '예외 전환', deep: false,
        d: '하위 계층의 예외를 잡아 의미가 더 분명한 다른 예외로 감싸서 다시 던지는 기법이다.',
        how: [
          '`catch (SQLException e) { throw new OrderSaveException("주문 저장 실패", e); }`처럼 원인 예외를 생성자에 넘긴다.',
          '- 기술 감추기: 서비스가 JDBC, JPA 같은 기술 예외에 의존하지 않게 된다. 스프링은 SQLException을 `DataAccessException` 계층으로 바꿔 준다.',
          '- 의미 부여: 비즈니스 맥락이 담긴 예외로 바꿔 공통 예외 처리기에서 알맞은 응답으로 바꾸기 쉽다.'
        ],
        warn: ['원인(cause)을 넘기지 않으면 원래 스택 트레이스가 사라져 디버깅이 매우 어려워진다.'],
        rel: ['체크 예외', '언체크 예외'] }
    ]},
    { name: '제네릭', items: [
      { t: '제네릭', deep: false,
        d: '클래스나 메서드에서 쓸 타입을 바깥에서 지정하게 해 컴파일 시점에 타입을 검사하는 기능이다.',
        how: [
          '`List<String>`에 Integer를 넣으면 컴파일 오류가 나고, 꺼낼 때 `(String)` 캐스팅이 필요 없다.',
          '- 제네릭 클래스: `class Box<T> { T value; }`',
          '- 제네릭 메서드: `static <T> T first(List<T> list)`',
          '- 타입 제한: `<T extends Comparable<T>>`처럼 상한을 두면 T의 메서드를 쓸 수 있다.',
          '런타임 ClassCastException을 컴파일 오류로 앞당겨 잡아 준다는 것이 핵심 이점이다.'
        ],
        rel: ['타입 소거', '와일드카드 · PECS'] },
      { t: '타입 소거', deep: false,
        d: '하위 호환을 위해 컴파일 후 바이트코드에서 제네릭 타입 정보를 지우는 자바의 제네릭 구현 방식이다.',
        how: [
          '`List<String>`과 `List<Integer>`는 런타임에 모두 `List`가 되고, `T`는 Object(또는 상한 타입)로 바뀌며 필요한 곳에 캐스팅이 들어간다.',
          '- 런타임에 `new T()`, `T.class`, `instanceof List<String>`을 쓸 수 없다.',
          '- 제네릭 배열 `new T[]`를 만들 수 없다.',
          '- Jackson이나 RestClient로 `List<User>`를 역직렬화할 때 타입 정보가 없어 `TypeReference`, `ParameterizedTypeReference`로 타입을 따로 전달한다.'
        ],
        rel: ['제네릭'] },
      { t: '와일드카드 · PECS', deep: false,
        d: '`?`로 "어떤 타입이든"을 표현하고, extends와 super로 범위를 정해 제네릭 메서드를 유연하게 만드는 문법이다.',
        how: [
          '- `<? extends T>`: T와 그 하위 타입. 안에서 값을 꺼내 읽기만 할 때 쓴다(생산자). 값을 넣을 수는 없다.',
          '- `<? super T>`: T와 그 상위 타입. 안에 값을 넣을 때 쓴다(소비자).',
          '- PECS: Producer-Extends, Consumer-Super로 기억한다.',
          '예: `Collections.copy(List<? super T> dest, List<? extends T> src)`는 src에서 읽고 dest에 쓴다.'
        ],
        rel: ['제네릭'] }
    ]},
    { name: 'Java 버전별 기능', items: [
      { t: 'Java 8', deep: false,
        d: '2014년 LTS 버전으로, 람다와 스트림을 도입해 현대 자바의 출발점이 된 버전이다.',
        how: [
          '- 람다와 함수형 인터페이스: `list.forEach(x -> System.out.println(x))`',
          '- 스트림 API: `filter`, `map`, `collect`로 컬렉션을 선언적으로 처리한다.',
          '- `Optional`: null일 수 있는 반환값을 명시한다.',
          '- 새 날짜·시간 API: `LocalDate`, `LocalDateTime`, `ZonedDateTime`(불변, 스레드 안전).',
          '- 인터페이스 default·static 메서드, PermGen을 대체한 Metaspace.'
        ],
        rel: ['Java 11'] },
      { t: 'Java 11', deep: false,
        d: '2018년 LTS 버전으로, 표준 HTTP 클라이언트와 문자열 편의 메서드가 추가되었다.',
        how: [
          '- 표준 `HttpClient`: HTTP/2와 비동기 호출을 지원한다.',
          '- `String`의 `isBlank()`, `strip()`, `lines()`, `repeat()`.',
          '- 람다 파라미터에 `var` 사용. 지역 변수 타입 추론 `var` 자체는 Java 10에서 들어왔다.',
          '- 소스 파일 하나를 컴파일 없이 `java Hello.java`로 실행할 수 있다.'
        ],
        rel: ['Java 8', 'Java 17'] },
      { t: 'Java 17', deep: false,
        d: '2021년 LTS 버전으로, record와 sealed 클래스가 정식 기능이 되었고 스프링 부트 3의 최소 버전이다.',
        how: [
          '- `record`: 불변 데이터 클래스. 생성자, getter, equals, hashCode, toString을 자동으로 만든다. DTO에 많이 쓴다.',
          '- `sealed` 클래스: `permits`로 상속할 수 있는 클래스를 제한한다.',
          '- 텍스트 블록(`"""`): 여러 줄 문자열을 그대로 쓴다.',
          '- `instanceof` 패턴 매칭: `if (o instanceof String s)`로 캐스팅을 생략한다.',
          '- switch 표현식: `case A -> ...` 형태로 값을 반환한다.'
        ],
        rel: ['Java 11', 'Java 21'] },
      { t: 'Java 21', deep: false,
        d: '2023년 LTS 버전으로, 가상 스레드가 정식 기능이 되어 서버 동시성 모델에 큰 변화를 가져왔다.',
        how: [
          '- 가상 스레드: JVM이 관리하는 가벼운 스레드로, 블로킹 코드를 그대로 두고도 많은 동시 요청을 처리한다. 스프링 부트 3.2+에서 `spring.threads.virtual.enabled=true`로 켠다.',
          '- switch 패턴 매칭과 record 패턴: 타입과 구조로 분기하고 값을 꺼낸다.',
          '- Sequenced Collections: `getFirst()`, `getLast()`, `reversed()`.',
          '- 세대별 ZGC.'
        ],
        rel: ['Java 17', 'Java 25', 'ZGC'] },
      { t: 'Java 25', deep: false,
        d: '2025년 9월 출시된 LTS 버전으로, 작성 편의 기능과 동시성 관련 API가 정식 기능이 되었다.',
        how: [
          '- 모듈 import 선언: `import module java.base;`로 모듈의 패키지를 한 번에 가져온다.',
          '- 간결한 소스 파일과 인스턴스 main 메서드: 클래스 선언 없이 `void main()`만으로 프로그램을 작성한다.',
          '- ScopedValue: ThreadLocal보다 안전하고 가벼운 방식으로 값을 하위 호출과 가상 스레드에 전달한다.',
          '- 생성자에서 `super()` 호출 전에 검증 코드를 쓸 수 있는 유연한 생성자 본문.'
        ],
        warn: ['운영 환경은 LTS 버전(8, 11, 17, 21, 25)을 기준으로 맞춘다. 면접에서는 8의 람다·스트림, 17의 record, 21의 가상 스레드가 가장 많이 나온다.'],
        rel: ['Java 21'] }
    ]}
  ],
  must: [
    '`==`는 참조 비교, `equals`는 값 비교다. Integer는 -128~127만 캐시되어 그 밖에서는 `==` 비교가 false가 된다.',
    '자바는 항상 값으로 전달한다. 객체는 참조값이 복사되어 전달된다.',
    'static 컬렉션, 해제하지 않은 리스너, 지우지 않은 ThreadLocal이 메모리 누수의 흔한 원인이다.',
    '`Optional`은 반환 타입에 쓰고, 필드나 파라미터에는 쓰지 않는다.'
  ]
};
