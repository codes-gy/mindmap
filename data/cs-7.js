(window.MINDMAP = window.MINDMAP || {})['cs-7'] = {
  name: '객체지향 · 설계',
  groups: [
    { name: 'OOP 4대 특성', items: [
      { t: '캡슐화', deep: false,
        d: '데이터와 그 데이터를 다루는 기능을 객체 하나로 묶고, 내부 구현은 숨긴 채 공개된 메서드로만 상호작용하게 하는 것이다.',
        how: [
          '필드를 `private`으로 두고, 상태를 바꾸는 규칙은 객체 안의 메서드에 둔다.',
          '- 나쁜 예: `account.balance -= 1000` — 잔액 검증이 호출하는 쪽마다 흩어진다.',
          '- 좋은 예: `account.withdraw(1000)` — 잔액 부족 검증을 객체가 스스로 한다.',
          '내부 구현을 바꿔도 공개 메서드가 같으면 사용하는 쪽은 영향을 받지 않는다. 무분별한 getter·setter는 캡슐화를 깨므로 "묻지 말고 시켜라(Tell, Don\'t Ask)"를 따른다.'
        ],
        rel: ['추상화', '디미터 법칙'] },
      { t: '상속', deep: false,
        d: '기존 클래스의 필드와 메서드를 물려받아 새 클래스를 정의하는 것으로, is-a 관계를 표현한다.',
        how: [
          '`class Dog extends Animal`처럼 부모의 기능을 재사용하고 필요한 부분만 오버라이딩한다.',
          '- 장점: 코드 재사용, 계층 구조 표현, 다형성의 기반.',
          '- 단점: 부모의 내부 구현에 강하게 묶여 부모가 바뀌면 자식이 깨질 수 있다. 자바는 클래스 단일 상속만 허용한다.',
          '오버로딩(같은 이름, 다른 파라미터, 컴파일 타임 결정)과 오버라이딩(부모 메서드 재정의, 런타임 결정)을 구분한다.'
        ],
        warn: ['재사용만을 위해 상속하지 않는다. 진짜 is-a 관계가 아니면 조합을 쓴다.'],
        rel: ['상속보다 조합', '다형성'] },
      { t: '다형성', deep: true,
        d: '같은 타입의 참조로 같은 메시지를 보내도 실제 객체에 따라 다르게 동작하는 성질이다.',
        why: '호출하는 쪽이 구체 클래스를 몰라도 되므로, 새 구현을 추가해도 기존 코드를 고치지 않는다. OCP와 DIP, 스프링의 DI가 모두 다형성 위에서 동작한다.',
        how: [
          '1) 인터페이스나 부모 타입으로 역할을 정의한다(`PaymentClient`).',
          '2) 여러 구현체가 각자 방식으로 메서드를 오버라이딩한다(`KakaoPayClient`, `TossPayClient`).',
          '3) 사용하는 쪽은 부모 타입 변수로 호출한다(`client.pay(...)`).',
          '4) 실제 어떤 메서드가 실행될지는 런타임에 객체의 실제 타입을 보고 결정된다(동적 바인딩).',
          '- 넓은 의미로는 오버로딩(같은 이름, 다른 파라미터)도 다형성에 포함하지만, 면접에서 다형성이라 하면 보통 오버라이딩을 통한 서브타입 다형성을 말한다.'
        ],
        code: `interface PaymentClient {
    void pay(long amount);
}
class KakaoPayClient implements PaymentClient {
    public void pay(long amount) { /* 카카오페이 API 호출 */ }
}
class TossPayClient implements PaymentClient {
    public void pay(long amount) { /* 토스 API 호출 */ }
}

class OrderService {
    private final PaymentClient client;   // 구현체를 모른다
    OrderService(PaymentClient client) { this.client = client; }
    void order(long amount) { client.pay(amount); } // 런타임에 실제 구현이 실행됨
}`,
        warn: [
          '`if (client instanceof KakaoPayClient)` 같은 타입 분기가 늘어나면 다형성을 제대로 쓰지 못하고 있다는 신호다.',
          'static 메서드와 private 메서드, 필드는 오버라이딩되지 않아 동적 바인딩 대상이 아니다.'
        ],
        qa: ['다형성을 예시로 설명해 주세요.', '같은 PaymentClient 타입으로 pay를 호출해도 실제 객체가 카카오페이 구현이면 카카오페이로, 토스 구현이면 토스로 결제되는 것이 다형성입니다. 호출하는 쪽은 인터페이스에만 의존하므로 새 결제 수단을 추가해도 서비스 코드는 바뀌지 않습니다. 스프링은 이런 구현체를 DI로 주입해 줍니다.'],
        rel: ['상속', 'OCP', 'DIP', '전략 패턴'] },
      { t: '추상화', deep: false,
        d: '복잡한 대상에서 공통적이고 핵심적인 특징만 뽑아내 단순한 개념으로 표현하는 것이다.',
        how: [
          '자바에서는 인터페이스와 추상 클래스로 "무엇을 하는가"만 정의하고 "어떻게 하는가"는 구현체에 맡긴다.',
          '예: `OrderRepository`는 `save`, `findById`만 정의하고, JPA로 구현할지 JDBC로 구현할지는 감춘다.',
          '사용하는 쪽은 세부 구현을 몰라도 되므로 이해하기 쉽고, 구현을 바꿔도 영향을 받지 않는다.'
        ],
        rel: ['캡슐화', '인터페이스', '추상 클래스'] }
    ]},
    { name: 'SOLID', items: [
      { t: 'SRP', deep: true,
        d: '단일 책임 원칙. 클래스는 하나의 책임만 가져야 하며, 변경되는 이유가 하나뿐이어야 한다.',
        why: '여러 책임이 한 클래스에 섞이면 한 기능을 고칠 때 관련 없는 기능까지 깨질 수 있고, 클래스가 커져 이해와 테스트가 어려워진다.',
        how: [
          '"책임"은 "변경의 이유"로 판단한다. 누가(어떤 요구사항이) 이 코드를 바꾸게 만드는지를 본다.',
          '1) 클래스가 바뀌는 이유를 나열해 본다(할인 정책 변경, 메일 문구 변경, 로그 형식 변경…).',
          '2) 이유가 여러 개면 이유별로 클래스를 나눈다.',
          '3) 나눈 클래스끼리는 인터페이스로 협력하게 한다.',
          '- 신호: 클래스 이름에 And·Manager가 붙거나, 의존성이 많거나, 메서드들이 서로 다른 필드만 쓰면 책임이 섞인 것이다.',
          '- 스프링 예: Controller(요청·응답), Service(유스케이스), Repository(저장)로 나누는 계층 구조가 SRP의 적용이다.'
        ],
        code: `// 위반: 주문 계산, 저장, 메일 발송이 한 클래스에
class OrderService {
    long calculatePrice(Order o) { ... }
    void save(Order o) { ... }        // DB 변경 시 수정
    void sendMail(Order o) { ... }    // 메일 문구 변경 시 수정
}

// 적용: 변경 이유별로 분리
class PriceCalculator { long calculate(Order o) { ... } }
interface OrderRepository { void save(Order o); }
class OrderNotifier { void notifyOrdered(Order o) { ... } }`,
        warn: ['너무 잘게 나누면 클래스만 많아지고 흐름을 따라가기 어렵다. 실제로 함께 바뀌는 코드는 함께 둔다.'],
        qa: ['SRP를 실제로 어떻게 적용했나요?', '주문 서비스에 가격 계산, 저장, 알림 발송이 섞여 있어 알림 문구를 바꿀 때도 주문 로직을 건드려야 했습니다. 변경 이유별로 가격 계산기, 리포지토리, 알림 클래스로 나누고 서비스는 이들을 조율만 하게 했습니다. 그 결과 각 클래스를 독립적으로 테스트하고 수정할 수 있었습니다.'],
        rel: ['OCP', '계층형 아키텍처'] },
      { t: 'OCP', deep: true,
        d: '개방-폐쇄 원칙. 소프트웨어는 확장에는 열려 있고 수정에는 닫혀 있어야 한다.',
        why: '새 기능을 추가할 때마다 기존 코드를 고치면 이미 검증된 코드에 버그가 들어갈 위험이 커진다. 기존 코드는 그대로 두고 새 코드를 추가하는 방식으로 확장해야 안전하다.',
        how: [
          '1) 바뀔 수 있는 부분(할인 정책, 결제 수단)을 찾아 인터페이스로 추상화한다.',
          '2) 기존 코드는 인터페이스에만 의존하게 한다.',
          '3) 새 요구사항이 오면 새 구현 클래스를 추가한다.',
          '4) 어떤 구현을 쓸지는 바깥(설정, DI 컨테이너)에서 정한다.',
          '- 신호: 새 종류가 추가될 때마다 `if/else`나 `switch`가 늘어나면 OCP 위반이다.',
          '- 스프링 DI는 구현체를 설정으로 바꿔 끼우게 해 OCP를 지키기 쉽게 만든다. 순수 자바에서 `new FixDiscountPolicy()`를 직접 쓰면 구현을 바꿀 때 클라이언트 코드를 고쳐야 한다.'
        ],
        code: `interface DiscountPolicy { long discount(Member m, long price); }

class FixDiscountPolicy implements DiscountPolicy {
    public long discount(Member m, long price) { return m.isVip() ? 1000 : 0; }
}
// 새 정책 추가: 기존 코드는 수정하지 않고 클래스만 추가
class RateDiscountPolicy implements DiscountPolicy {
    public long discount(Member m, long price) { return m.isVip() ? price / 10 : 0; }
}

@Service
class OrderService {
    private final DiscountPolicy policy;  // 어떤 정책인지 모른다
    OrderService(DiscountPolicy policy) { this.policy = policy; }
}`,
        warn: ['모든 곳을 미리 추상화하면 과설계가 된다. 실제로 변경이 생기거나 변경 가능성이 높은 지점에 적용한다.'],
        qa: ['OCP를 설명하고 예를 들어 주세요.', '확장에는 열려 있고 수정에는 닫혀 있어야 한다는 원칙입니다. 예를 들어 할인 정책을 DiscountPolicy 인터페이스로 두고 정액, 정률 정책을 구현체로 만들면, 새 정책이 생겨도 클래스만 추가하고 주문 서비스 코드는 고치지 않습니다. 어떤 구현을 쓸지는 스프링 DI 설정이 정합니다.'],
        rel: ['DIP', '다형성', '전략 패턴'] },
      { t: 'LSP', deep: true,
        d: '리스코프 치환 원칙. 하위 타입은 언제나 상위 타입을 대신해도 프로그램이 올바르게 동작해야 한다.',
        why: '다형성은 "부모 타입으로 호출해도 기대한 대로 동작한다"는 믿음 위에서 성립한다. 하위 타입이 부모의 약속을 깨면 부모 타입을 쓰는 모든 코드가 언제 깨질지 모르게 된다.',
        how: [
          '하위 타입은 컴파일만 되는 것이 아니라 상위 타입의 "행동 규약"을 지켜야 한다.',
          '- 사전 조건을 더 강하게 만들면 안 된다: 부모가 0 이상을 받는데 자식이 양수만 받으면 위반이다.',
          '- 사후 조건을 약하게 만들면 안 된다: 부모가 정렬된 결과를 약속했으면 자식도 지켜야 한다.',
          '- 부모가 던지지 않는 예외를 새로 던지면 안 된다.',
          '대표 위반 예: 정사각형이 직사각형을 상속하고 `setWidth`가 높이까지 바꾸면, 너비 5·높이 4로 설정하고 넓이 20을 기대한 코드가 25를 받게 된다.',
          '또 다른 예: `List`를 구현하면서 `add`에서 `UnsupportedOperationException`을 던지는 불변 리스트는 사용하는 쪽이 이를 알아야 해 LSP 관점에서 주의가 필요하다.'
        ],
        code: `class Rectangle {
    protected int width, height;
    void setWidth(int w) { width = w; }
    void setHeight(int h) { height = h; }
    int area() { return width * height; }
}
class Square extends Rectangle {
    void setWidth(int w) { width = w; height = w; }   // 부모의 약속을 깨뜨림
    void setHeight(int h) { width = h; height = h; }
}

void resize(Rectangle r) {
    r.setWidth(5); r.setHeight(4);
    assert r.area() == 20;   // Square가 들어오면 16 → 실패
}`,
        warn: ['수학적 is-a(정사각형은 직사각형이다)가 코드의 is-a를 보장하지 않는다. 행동이 같아야 상속한다.'],
        qa: ['LSP 위반 사례를 들어 주세요.', '정사각형이 직사각형을 상속해 너비를 바꿀 때 높이도 같이 바꾸면, 직사각형을 받아 너비 5와 높이 4를 설정한 코드가 넓이 20을 기대했다가 16을 받습니다. 하위 타입이 상위 타입의 행동 규약을 깨서 대체할 수 없게 된 것이므로, 이런 경우 상속 대신 별도의 타입으로 분리합니다.'],
        rel: ['상속', '다형성'] },
      { t: 'ISP', deep: true,
        d: '인터페이스 분리 원칙. 클라이언트는 자신이 쓰지 않는 메서드에 의존하지 않아야 하며, 큰 인터페이스는 역할별로 작게 나눈다.',
        why: '큰 인터페이스 하나에 여러 역할을 몰아 두면 일부 기능만 필요한 구현체도 쓰지 않는 메서드를 억지로 구현해야 하고, 관계없는 메서드가 바뀌어도 모든 구현체와 사용처가 영향을 받는다.',
        how: [
          '1) 인터페이스를 사용하는 쪽(클라이언트)이 실제로 어떤 메서드를 쓰는지 본다.',
          '2) 함께 쓰이는 메서드끼리 묶어 역할별 인터페이스로 나눈다.',
          '3) 여러 역할을 하는 클래스는 여러 인터페이스를 구현한다.',
          '- 예: 복합기 인터페이스에 print·scan·fax가 모두 있으면 프린터만 되는 기기도 scan, fax를 구현해야 한다. `Printer`, `Scanner`, `Fax`로 나눈다.',
          '- 스프링 예: `UserDetailsService`(조회만), `UserDetailsManager`(생성·수정 포함)처럼 역할을 나눠 둔다.'
        ],
        code: `// 위반
interface MultiFunctionDevice { void print(); void scan(); void fax(); }
class SimplePrinter implements MultiFunctionDevice {
    public void print() { ... }
    public void scan() { throw new UnsupportedOperationException(); }
    public void fax()  { throw new UnsupportedOperationException(); }
}

// 적용
interface Printer { void print(); }
interface Scanner { void scan(); }
class SimplePrinter2 implements Printer { public void print() { ... } }
class OfficeMachine implements Printer, Scanner { ... }`,
        warn: ['메서드 하나짜리 인터페이스를 지나치게 많이 만들면 오히려 구조를 파악하기 어렵다. 실제 사용 단위로 나눈다.'],
        qa: ['ISP는 왜 필요한가요?', '하나의 큰 인터페이스에 여러 역할이 섞여 있으면 일부만 필요한 구현체도 나머지를 억지로 구현해야 하고, 쓰지 않는 메서드가 바뀌어도 영향을 받습니다. 사용하는 쪽 기준으로 인터페이스를 작게 나누면 결합이 줄고 구현과 테스트가 쉬워집니다.'],
        rel: ['SRP', '인터페이스'] },
      { t: 'DIP', deep: true,
        d: '의존 역전 원칙. 고수준 모듈은 저수준 모듈의 구현에 의존하지 않고, 둘 다 추상화(인터페이스)에 의존해야 한다.',
        why: '비즈니스 로직(고수준)이 DB나 외부 API(저수준) 구현에 직접 의존하면 기술을 바꿀 때마다 핵심 로직을 고쳐야 하고, 단위 테스트에서 가짜 구현으로 바꾸기도 어렵다.',
        how: [
          '1) 고수준 모듈(서비스)이 필요한 기능을 인터페이스로 정의한다(`OrderRepository`).',
          '2) 저수준 모듈(JPA 구현, 외부 API 클라이언트)이 그 인터페이스를 구현한다.',
          '3) 어떤 구현을 쓸지는 바깥(DI 컨테이너)이 주입한다.',
          '"역전"이라는 이름은 원래 서비스 → DB 구현으로 향하던 의존 화살표가, 저수준 구현 → 고수준이 정의한 인터페이스로 방향이 뒤집히기 때문에 붙었다.',
          '- 인터페이스의 소유자는 사용하는 쪽(고수준)이어야 한다. 헥사고날 아키텍처의 포트가 바로 이 구조다.',
          '- DI는 DIP를 실현하는 도구다. DIP는 원칙, DI는 방법이다.'
        ],
        code: `// 고수준 모듈이 정의한 추상화
public interface OrderRepository {
    Order save(Order order);
}

@Service
class OrderService {
    private final OrderRepository repository;   // 구현을 모른다
    OrderService(OrderRepository repository) { this.repository = repository; }
}

// 저수준 모듈이 추상화를 구현
@Repository
class JpaOrderRepository implements OrderRepository {
    public Order save(Order order) { ... }
}
// 테스트에서는 MemoryOrderRepository를 주입`,
        warn: ['인터페이스를 저수준 패키지(infra) 안에 두면 고수준이 여전히 그 패키지에 의존하게 된다. 인터페이스는 도메인·서비스 쪽에 둔다.'],
        qa: ['DIP와 DI의 차이는 무엇인가요?', 'DIP는 고수준 모듈과 저수준 모듈이 모두 추상화에 의존해야 한다는 설계 원칙이고, DI는 필요한 구현체를 외부에서 주입하는 기법입니다. 서비스가 OrderRepository 인터페이스에만 의존하게 설계하는 것이 DIP이고, 스프링이 JPA 구현체를 생성자로 넣어 주는 것이 DI입니다. DI는 DIP를 실현하는 수단입니다.'],
        rel: ['OCP', '헥사고날 아키텍처', '다형성'] }
    ]},
    { name: '설계 원칙', items: [
      { t: '상속보다 조합', deep: false,
        d: '다른 클래스의 기능이 필요할 때 상속하지 말고, 그 객체를 필드로 가지고 일을 맡기는(has-a) 방식을 우선하라는 원칙이다.',
        how: [
          '- 취약한 기반 클래스 문제: HashSet을 상속해 add 횟수를 세는데, 부모의 addAll이 내부적으로 add를 호출하면 개수가 두 번 세어진다. 부모 구현에 의존했기 때문이다.',
          '- 캡슐화 약화: 부모의 public 메서드가 자식에게 그대로 노출된다.',
          '- 조합의 장점: 내부 객체의 공개 인터페이스만 쓰므로 결합이 느슨하고, 실행 중에 다른 구현으로 바꿀 수 있다.',
          '상속은 진짜 is-a 관계이면서 부모가 확장을 위해 설계된 경우에만 쓴다(Effective Java 아이템 18).'
        ],
        rel: ['상속', '전략 패턴', '데코레이터 패턴'] },
      { t: '인터페이스', deep: false,
        d: '"무엇을 할 수 있는가"라는 역할(능력)만 정의하는 타입으로, 한 클래스가 여러 인터페이스를 구현할 수 있다.',
        how: [
          '- 필드는 상수(`public static final`)만 가질 수 있다.',
          '- Java 8부터 default·static 메서드, Java 9부터 private 메서드를 가질 수 있다.',
          '- 서로 관련 없는 클래스에도 같은 역할을 부여할 수 있다. 예: `Comparable`, `Runnable`, `AutoCloseable`.',
          '구현이 아닌 역할에 의존하게 해 다형성, OCP, DIP의 기반이 된다.'
        ],
        rel: ['추상 클래스', 'DIP'] },
      { t: '추상 클래스', deep: false,
        d: '"무엇인가"라는 공통 개념을 정의하고, 하위 클래스가 공유할 상태와 일부 구현을 가질 수 있는 미완성 클래스다.',
        how: [
          '- 인스턴스 필드와 생성자를 가질 수 있다.',
          '- 일부 메서드만 abstract로 두고 나머지는 구현해 둘 수 있어 템플릿 메서드 패턴에 맞다.',
          '- 단일 상속만 가능하다.',
          '예: `AbstractList`, 스프링의 `OncePerRequestFilter`. 보통 인터페이스를 먼저 정의하고, 공통 구현이 필요하면 `AbstractXxx` 골격 클래스를 함께 제공한다.'
        ],
        rel: ['인터페이스', '템플릿 메서드 패턴'] },
      { t: '디미터 법칙', deep: false,
        d: '객체는 직접 아는 협력자에게만 메시지를 보내고, 협력자의 내부 구조를 따라 들어가지 말라는 원칙이다.',
        how: [
          '`order.getCustomer().getAddress().getCity()`처럼 점이 길게 이어지면 호출하는 쪽이 여러 객체의 내부 구조를 알게 되어 결합이 커진다.',
          '대신 `order.shippingCity()`처럼 필요한 일을 직접 시킨다.',
          '"묻지 말고 시켜라"와 같은 맥락이며 캡슐화를 지키는 방법이다.'
        ],
        warn: ['스트림이나 빌더처럼 같은 객체를 반환하는 메서드 체이닝은 위반이 아니다.'],
        rel: ['캡슐화'] }
    ]},
    { name: '생성 패턴', items: [
      { t: '싱글톤 패턴', deep: false,
        d: '클래스의 인스턴스를 하나만 만들고 어디서든 그 인스턴스에 접근하게 하는 패턴이다.',
        how: [
          '직접 구현하면 private 생성자와 static 인스턴스, `getInstance()`를 쓴다.',
          '- 문제점: 클라이언트가 구체 클래스에 의존해 DIP를 어기고, 테스트에서 다른 객체로 바꾸기 어렵고, 상속이 불가능하다.',
          '- 스프링은 싱글톤 레지스트리: 평범한 클래스를 컨테이너가 하나만 만들어 관리하므로 이런 단점 없이 싱글톤을 쓴다.'
        ],
        warn: ['싱글톤 객체에 요청마다 바뀌는 상태를 두면 동시성 버그가 생긴다. 무상태로 설계한다.'],
        rel: ['팩토리 패턴'] },
      { t: '팩토리 패턴', deep: false,
        d: '객체 생성 로직을 별도의 메서드나 클래스로 분리해, 사용하는 쪽이 어떤 구체 클래스를 만들지 몰라도 되게 하는 패턴이다.',
        how: [
          '- 정적 팩토리 메서드: `LocalDate.of(...)`, `List.of(...)`처럼 이름 있는 생성 메서드를 제공한다. 캐싱하거나 하위 타입을 반환할 수 있다.',
          '- 팩토리 메서드 패턴: 생성할 객체 타입을 하위 클래스가 결정한다.',
          '- 추상 팩토리: 관련 객체 묶음을 일관되게 만든다.',
          '스프링의 `BeanFactory`와 `FactoryBean`이 대표적이다.'
        ],
        rel: ['싱글톤 패턴', '빌더 패턴'] },
      { t: '빌더 패턴', deep: false,
        d: '필드가 많거나 선택적인 객체를 단계적으로, 읽기 쉽게 만드는 패턴이다.',
        how: [
          '생성자 파라미터가 많으면 순서를 헷갈리기 쉽다. `Order.builder().memberId(1L).price(1000).build()`처럼 이름으로 값을 지정한다.',
          '- 불변 객체를 만들기 좋고, 필수 값 검증을 `build()`에서 한 번에 할 수 있다.',
          '- 실무에서는 Lombok `@Builder`를 많이 쓴다.'
        ],
        warn: ['JPA 엔티티에 무분별하게 빌더를 열어 두면 필수 값 없이 객체가 만들어질 수 있다.'],
        rel: ['팩토리 패턴'] }
    ]},
    { name: '구조 패턴', items: [
      { t: '프록시 패턴', deep: true,
        d: '실제 객체 대신 같은 인터페이스를 가진 대리 객체를 두어, 실제 객체에 대한 접근을 제어하거나 부가 기능을 더하는 패턴이다.',
        why: '실제 객체의 코드를 고치지 않고도 지연 로딩, 접근 제어, 캐싱, 트랜잭션 같은 기능을 끼워 넣을 수 있다. 클라이언트는 프록시인지 실제 객체인지 몰라도 된다.',
        how: [
          '1) 프록시는 실제 객체와 같은 타입(인터페이스 구현 또는 클래스 상속)이다.',
          '2) 클라이언트는 실제 객체 대신 프록시를 주입받는다.',
          '3) 프록시가 호출을 받아 앞뒤로 부가 작업을 하고 실제 객체에 위임한다.',
          '- 접근 제어 목적: 권한 확인, 지연 로딩(JPA 지연 로딩 프록시), 캐싱.',
          '- 부가 기능 목적(데코레이터와 구조가 같다): 로깅, 트랜잭션.',
          '- 스프링 AOP, `@Transactional`, `@Cacheable`, `@Async`가 모두 프록시로 동작한다. 그래서 같은 클래스 안의 내부 호출에는 적용되지 않는다.'
        ],
        code: `interface OrderService { void order(Long id); }

class RealOrderService implements OrderService {
    public void order(Long id) { /* 핵심 로직 */ }
}

class TransactionProxy implements OrderService {
    private final OrderService target;
    TransactionProxy(OrderService target) { this.target = target; }

    public void order(Long id) {
        tx.begin();
        try { target.order(id); tx.commit(); }   // 실제 객체에 위임
        catch (RuntimeException e) { tx.rollback(); throw e; }
    }
}`,
        warn: [
          '프록시를 거치지 않는 내부 호출(this.method())에는 부가 기능이 적용되지 않는다.',
          'CGLIB 프록시는 상속으로 만들므로 final 클래스나 final 메서드에는 적용할 수 없다.'
        ],
        qa: ['스프링에서 프록시 패턴은 어디에 쓰이나요?', '스프링 AOP가 대표적입니다. @Transactional이 붙은 빈은 실제 객체 대신 프록시가 주입되고, 프록시가 트랜잭션을 시작한 뒤 실제 메서드를 호출하고 결과에 따라 커밋이나 롤백을 합니다. JPA 지연 로딩도 연관 엔티티 자리에 프록시를 두었다가 실제 접근할 때 조회합니다.'],
        rel: ['데코레이터 패턴', '어댑터 패턴'] },
      { t: '데코레이터 패턴', deep: false,
        d: '객체를 같은 인터페이스의 다른 객체로 감싸서 기능을 동적으로 덧붙이는 패턴이다.',
        how: [
          '데코레이터는 감싼 객체에 일을 맡기면서 앞뒤로 기능을 추가한다. 여러 겹으로 감쌀 수 있다.',
          '예: `new BufferedReader(new InputStreamReader(new FileInputStream(file)))` — 각 층이 버퍼링, 문자 변환 기능을 더한다.',
          '구조는 프록시와 같지만, 프록시는 "접근 제어"가, 데코레이터는 "기능 추가"가 의도다.'
        ],
        rel: ['프록시 패턴', '상속보다 조합'] },
      { t: '어댑터 패턴', deep: false,
        d: '호환되지 않는 인터페이스를 가진 객체를 클라이언트가 기대하는 인터페이스로 바꿔 주는 패턴이다.',
        how: [
          '돼지코 변환기처럼, 기존 코드를 고치지 않고 중간에 변환 객체를 둔다.',
          '- 스프링 MVC의 `HandlerAdapter`: `@RequestMapping` 메서드, `HttpRequestHandler` 등 형태가 다른 핸들러를 DispatcherServlet이 같은 방식으로 실행하게 해 준다.',
          '- 외부 결제 SDK를 우리 `PaymentClient` 인터페이스에 맞추는 클래스도 어댑터다.'
        ],
        rel: ['프록시 패턴', '헥사고날 아키텍처'] }
    ]},
    { name: '행위 패턴', items: [
      { t: '전략 패턴', deep: true,
        d: '바뀔 수 있는 알고리즘을 인터페이스로 분리하고, 실행 시점에 원하는 구현을 골라 끼우는 패턴이다.',
        why: '할인 정책이나 결제 수단처럼 종류가 늘어날 수 있는 로직을 `if/else`로 처리하면 새 종류가 생길 때마다 기존 코드를 고쳐야 한다. 전략으로 분리하면 새 클래스만 추가하면 된다(OCP).',
        how: [
          '1) 전략 인터페이스를 정의한다(`DiscountPolicy`).',
          '2) 알고리즘별로 구현 클래스를 만든다(`FixDiscountPolicy`, `RateDiscountPolicy`).',
          '3) 사용하는 쪽(컨텍스트)은 전략 인터페이스를 필드로 갖고 일을 맡긴다.',
          '4) 어떤 전략을 쓸지는 생성자 주입이나 실행 시 선택으로 정한다.',
          '- 스프링에서는 같은 인터페이스의 구현체를 `Map<String, DiscountPolicy>`로 모두 주입받아, 요청 값에 따라 골라 쓰는 방식이 자주 쓰인다.',
          '- 예: `Comparator`, `PasswordEncoder`, 스프링 시큐리티의 `AuthenticationProvider`.'
        ],
        code: `interface DiscountPolicy { long discount(long price); }

@Component("fix")
class FixDiscountPolicy implements DiscountPolicy {
    public long discount(long price) { return 1000; }
}
@Component("rate")
class RateDiscountPolicy implements DiscountPolicy {
    public long discount(long price) { return price / 10; }
}

@Service
class DiscountService {
    private final Map<String, DiscountPolicy> policies; // 빈 이름 → 구현체
    DiscountService(Map<String, DiscountPolicy> policies) { this.policies = policies; }

    long discount(String code, long price) {
        return policies.get(code).discount(price);
    }
}`,
        warn: ['전략이 두세 개뿐이고 늘어날 가능성이 없다면 단순한 분기가 더 읽기 쉬울 수 있다.'],
        qa: ['전략 패턴을 어디에 적용해 보셨나요?', '결제 수단별 결제 로직을 PaymentStrategy 인터페이스로 분리하고 카카오페이, 토스 구현체를 빈으로 등록했습니다. 서비스는 Map으로 모든 구현체를 주입받아 요청의 결제 수단 코드로 골라 실행합니다. 새 결제 수단이 생기면 구현 클래스만 추가하면 되어 기존 코드를 고치지 않습니다.'],
        rel: ['OCP', '다형성', '템플릿 메서드 패턴'] },
      { t: '템플릿 메서드 패턴', deep: false,
        d: '알고리즘의 전체 흐름(뼈대)은 부모 클래스가 정하고, 바뀌는 일부 단계만 하위 클래스가 구현하는 패턴이다.',
        how: [
          '부모의 템플릿 메서드가 단계 순서를 고정하고, 단계 중 일부를 abstract 메서드로 남긴다.',
          '- 예: `OncePerRequestFilter`는 필터 공통 처리를 하고 `doFilterInternal`만 구현하게 한다.',
          '- 템플릿 콜백 패턴: 상속 대신 콜백(람다)으로 바뀌는 부분을 넘긴다. `JdbcTemplate`, `RestTemplate`, `TransactionTemplate`이 연결·해제·예외 처리 같은 반복 코드를 맡고 핵심 로직만 콜백으로 받는다.'
        ],
        warn: ['상속 기반이라 부모와 강하게 결합된다. 변하는 부분이 크면 전략 패턴이나 콜백 방식이 유연하다.'],
        rel: ['전략 패턴', '추상 클래스'] },
      { t: '옵저버 패턴', deep: false,
        d: '한 객체의 상태 변화를 그 객체를 구독하는 여러 객체에게 자동으로 알리는 패턴이다.',
        how: [
          '발행자는 구독자 목록만 알고 구독자의 구체 동작은 모른다. 구독자를 추가해도 발행자는 바뀌지 않는다.',
          '- 스프링: `ApplicationEventPublisher.publishEvent(new OrderCompletedEvent(...))`로 발행하고 `@EventListener` 메서드가 받는다.',
          '- `@TransactionalEventListener(phase = AFTER_COMMIT)`를 쓰면 트랜잭션이 커밋된 뒤에만 알림을 처리한다.',
          '서비스 간 직접 의존을 끊어 순환 참조를 해결하는 데에도 쓴다.'
        ],
        rel: ['전략 패턴'] }
    ]},
    { name: '아키텍처', items: [
      { t: '계층형 아키텍처', deep: false,
        d: '애플리케이션을 표현, 응용, 도메인, 인프라 계층으로 나누고 의존이 위에서 아래로만 흐르게 하는 구조다.',
        how: [
          '- Presentation(Controller): 요청을 받아 검증하고 응답 DTO로 바꾼다. 비즈니스 로직을 두지 않는다.',
          '- Application(Service): 유스케이스의 흐름을 조율하고 트랜잭션 경계를 가진다.',
          '- Domain: 엔티티와 도메인 규칙. 로직을 도메인 객체 안에 두면 응집도가 높아진다.',
          '- Infrastructure(Repository): DB, 외부 API, 메시지 큐 같은 기술 세부 사항.',
          '단순하고 익숙하지만, 결국 모든 계층이 DB 계층에 의존해 도메인 로직이 JPA 같은 기술에 묶이기 쉽다.'
        ],
        rel: ['헥사고날 아키텍처', 'SRP'] },
      { t: '헥사고날 아키텍처', deep: false,
        d: '도메인을 가운데 두고, 도메인이 정의한 인터페이스(포트)를 바깥 기술(어댑터)이 구현하게 하는 구조로, 포트와 어댑터 아키텍처라고도 한다.',
        how: [
          '- 인바운드 포트·어댑터: 웹 컨트롤러, 메시지 리스너가 유스케이스 인터페이스를 호출한다.',
          '- 아웃바운드 포트·어댑터: 도메인이 정의한 `LoadOrderPort`를 JPA 어댑터가 구현한다.',
          '- 모든 의존 방향이 도메인을 향하므로 DB나 프레임워크를 바꿔도 도메인은 영향을 받지 않고, 도메인을 스프링 없이 테스트할 수 있다.',
          '클린 아키텍처도 같은 생각(의존성은 안쪽으로만)을 바탕으로 한다.'
        ],
        warn: ['작은 CRUD 서비스에 적용하면 클래스와 매핑 코드만 늘어난다. 도메인 로직이 복잡할 때 효과가 크다.'],
        rel: ['계층형 아키텍처', 'DIP', '어댑터 패턴'] },
      { t: 'DDD 핵심 용어', deep: false,
        d: 'DDD(도메인 주도 설계)는 비즈니스 도메인의 언어와 규칙을 중심으로 모델과 코드를 설계하는 방법이다.',
        how: [
          '- 엔티티: 식별자로 구분되는 객체(주문, 회원).',
          '- 값 객체: 값으로만 비교되는 불변 객체(금액, 주소).',
          '- 애그리거트: 함께 일관성을 지켜야 하는 객체 묶음. 루트를 통해서만 수정하며 트랜잭션 경계가 된다.',
          '- 리포지토리: 애그리거트 단위로 저장하고 조회한다.',
          '- 도메인 이벤트: 도메인에서 일어난 중요한 사건(주문 완료).',
          '- 바운디드 컨텍스트: 같은 단어가 같은 의미로 쓰이는 경계. MSA에서 서비스 경계를 나누는 기준이 된다.'
        ],
        rel: ['헥사고날 아키텍처'] }
    ]}
  ],
  must: [
    '오버로딩은 같은 이름에 파라미터만 다른 메서드(컴파일 타임), 오버라이딩은 부모 메서드 재정의(런타임)다.',
    '불변 객체는 스레드 안전하고 동작을 예측하기 쉽다. 가능하면 불변으로 만든다.',
    '`a.getB().getC()`처럼 연쇄 호출이 길면 디미터 법칙 위반 신호다.',
    '테스트하기 어려운 코드는 결합도가 높다는 신호다.'
  ]
};
