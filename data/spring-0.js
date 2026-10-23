(window.MINDMAP = window.MINDMAP || {})['spring-0'] = {
  name: 'IoC · DI',
  groups: [
    { name: '제어의 역전', items: [
      { t: 'IoC (제어의 역전)', deep: false,
        d: '객체의 생성, 연결, 생명주기 관리를 개발자 코드가 아니라 프레임워크(스프링 컨테이너)가 맡는 설계 원칙이다.',
        how: [
          '전통적인 코드에서는 객체가 자신이 쓸 객체를 직접 `new`로 만들고, 언제 생성하고 어떻게 연결할지도 스스로 결정한다. IoC에서는 이 결정권이 컨테이너로 넘어간다.',
          '개발자는 클래스와 의존 관계만 선언하고, 컨테이너가 애플리케이션 시작 시 빈을 만들어 연결한 뒤 필요할 때 개발자 코드를 호출한다.',
          '- 라이브러리: 내 코드가 라이브러리를 호출한다. 흐름의 제어권이 나에게 있다.',
          '- 프레임워크: 프레임워크가 내 코드를 호출한다. 제어권이 프레임워크에 있다.',
          '- IoC를 구현하는 방법에는 DI, 서비스 로케이터, 템플릿 메서드 등이 있고 스프링은 주로 DI를 쓴다.'
        ],
        qa: ['IoC와 DI는 어떤 관계인가요?', 'IoC는 제어권을 프레임워크로 넘긴다는 넓은 원칙이고, DI는 그 원칙을 구현하는 구체적인 방법 중 하나입니다. 스프링은 객체가 필요한 의존성을 컨테이너가 외부에서 넣어 주는 DI 방식으로 IoC를 실현합니다.'],
        rel: ['DI (의존성 주입)'] }
    ]},
    { name: '의존성 주입 방식', items: [
      { t: 'DI (의존성 주입)', deep: true,
        d: '객체가 필요로 하는 의존 객체를 내부에서 만들지 않고 외부(컨테이너)에서 넣어 받는 방식이다.',
        why: '객체가 의존 객체를 직접 만들면 구현이 바뀔 때마다 사용하는 코드도 고쳐야 하고, 테스트에서 가짜 객체로 바꿀 수도 없다. 생성 책임을 밖으로 빼서 결합도를 낮추기 위해서다.',
        how: [
          '1) 개발자는 클래스가 필요로 하는 의존성을 생성자 파라미터(또는 setter, 필드)로 선언한다.',
          '2) 컨테이너가 기동 시 빈 정의를 읽고 의존 관계 그래프를 만든다.',
          '3) 의존 대상 빈을 먼저 만들고, 이를 생성자 인자로 넘겨 빈을 생성한다.',
          '4) 완성된 빈을 싱글톤으로 보관하고 필요한 다른 빈에 주입한다.',
          '클래스는 구체 구현이 아니라 인터페이스에만 의존하고, 어떤 구현체를 넣을지는 설정이 결정한다.',
          '예를 들어 `OrderService`가 `new JdbcOrderRepository()`를 직접 만들면 JPA로 바꿀 때 서비스 코드를 고쳐야 한다. `OrderRepository` 인터페이스를 주입받으면 서비스 코드는 그대로 두고 구현체만 바꾼다.',
          '- 결합도 감소: 구현체 교체가 설정 변경만으로 가능하다(OCP).',
          '- 테스트 용이성: 테스트에서 가짜(Mock) 객체를 쉽게 끼워 넣는다.',
          '- 책임 분리: 사용하는 코드는 사용에만 집중하고 생성과 조립은 컨테이너가 맡는다.'
        ],
        code: `public interface OrderRepository {
    Order save(Order order);
}

@Repository
public class JpaOrderRepository implements OrderRepository { /* ... */ }

@Service
public class OrderService {
    private final OrderRepository orderRepository; // 인터페이스에만 의존한다

    public OrderService(OrderRepository orderRepository) { // 컨테이너가 구현체를 넣어 준다
        this.orderRepository = orderRepository;
    }
}`,
        qa: ['DI를 쓰면 무엇이 좋아지나요?', '구현체 대신 인터페이스에 의존하므로 결합도가 낮아져 구현을 바꿔도 사용하는 코드를 고칠 필요가 없습니다. 테스트에서 목 객체를 주입하기도 쉬워집니다.'],
        rel: ['IoC (제어의 역전)', '생성자 주입'] },
      { t: '생성자 주입', deep: true,
        d: '생성자 파라미터로 의존성을 받는 방식으로, 스프링 공식 문서가 권장하는 기본 주입 방법이다.',
        why: '의존성 없이는 객체 자체를 만들 수 없게 강제해, 누락과 변경 가능성을 원천적으로 막기 위해서다. 스프링 없이도 순수 자바로 테스트할 수 있다.',
        how: [
          '생성자가 하나뿐이면 `@Autowired`를 생략해도 스프링이 그 생성자로 주입한다(스프링 4.3+).',
          '1) 컨테이너가 빈을 만들 때 생성자 파라미터 타입에 맞는 빈을 찾는다.',
          '2) 찾은 빈들을 인자로 생성자를 호출해 객체를 만든다. 생성과 주입이 한 번에 끝난다.',
          '3) 필요한 빈이 없거나 여러 개면 기동 시점에 바로 예외가 나 애플리케이션이 뜨지 않는다.',
          '- 불변성: 필드를 `final`로 선언할 수 있어 생성 후 바뀌지 않는다.',
          '- 누락 방지: 필수 의존성 없이는 객체를 만들 수 없다. 필드 주입은 null로 실행되다 NPE가 난다.',
          '- 테스트 편의: `new OrderService(mockRepo)`로 스프링 없이 단위 테스트할 수 있다.',
          '- 순환 참조 조기 발견: 서로를 생성자로 요구하면 기동 시 오류로 드러난다.'
        ],
        code: `@Service
@RequiredArgsConstructor // Lombok이 final 필드로 생성자를 만들어 준다
public class OrderService {

    private final OrderRepository orderRepository;
    private final PaymentClient paymentClient;

    // Lombok 없이 쓰면 아래와 같다 (생성자가 하나라 @Autowired 생략)
    // public OrderService(OrderRepository orderRepository, PaymentClient paymentClient) {
    //     this.orderRepository = orderRepository;
    //     this.paymentClient = paymentClient;
    // }
}

// 테스트: 스프링 없이 바로 생성
OrderService service = new OrderService(mock(OrderRepository.class), mock(PaymentClient.class));`,
        warn: [
          '생성자 파라미터가 지나치게 많아지면 그 클래스의 책임이 너무 많다는 신호다. 분리를 고려한다.',
          '생성자가 여러 개면 어떤 생성자를 쓸지 `@Autowired`로 명시해야 한다.',
          '생성자 안에서 무거운 초기화(외부 호출)를 하지 않는다. 초기화 콜백으로 옮긴다.'
        ],
        qa: ['필드 주입 대신 생성자 주입을 권장하는 이유는?', '생성자 주입은 필드를 final로 둘 수 있어 불변이 보장되고, 필수 의존성이 없으면 객체 생성 자체가 실패해 누락을 기동 시점에 발견할 수 있습니다. 또 스프링 없이 new로 객체를 만들어 테스트할 수 있고, 순환 참조도 기동 시 바로 드러납니다. 그래서 스프링 공식 문서도 생성자 주입을 기본으로 권장합니다.'],
        rel: ['세터 주입', '필드 주입', '순환 참조'] },
      { t: '세터 주입', deep: false,
        d: '`@Autowired`를 붙인 setter 메서드로 객체 생성 이후에 의존성을 넣는 방식이다.',
        how: [
          '컨테이너가 기본 생성자로 객체를 먼저 만들고, 그 뒤 setter를 호출해 의존성을 넣는다.',
          '- 선택적 의존성: `@Autowired(required = false)`로 빈이 없어도 기동되게 할 수 있다.',
          '- 변경 가능성: 실행 중 의존성을 바꿔야 하는 드문 경우에 쓴다.',
          '- 단점: setter가 public이라 누구나 바꿀 수 있고, 주입 전에는 필드가 null이다. `final`을 쓸 수 없다.'
        ],
        code: `@Service
public class NotificationService {
    private SmsSender smsSender;

    @Autowired(required = false) // SmsSender 빈이 없어도 기동된다
    public void setSmsSender(SmsSender smsSender) {
        this.smsSender = smsSender;
    }
}`,
        warn: ['필수 의존성에는 세터 주입을 쓰지 않는다. 생성자 주입이 기본이다.'],
        rel: ['생성자 주입', '필드 주입'] },
      { t: '필드 주입', deep: false,
        d: '필드에 `@Autowired`를 직접 붙여 리플렉션으로 의존성을 넣는 방식이다.',
        how: [
          '코드가 가장 짧지만, 값은 스프링이 리플렉션으로만 넣을 수 있다.',
          '- 테스트 어려움: 스프링 없이 객체를 만들면 필드가 null이라 목 객체를 넣을 방법이 없다.',
          '- `final` 불가: 생성 후 주입되므로 불변으로 만들 수 없다.',
          '- 의존성 은닉: 생성자에 드러나지 않아 클래스가 무엇에 의존하는지, 얼마나 많이 의존하는지 보이지 않는다.',
          '테스트 클래스(`@SpringBootTest` 안의 필드)에서는 편의상 써도 괜찮다.'
        ],
        warn: ['애플리케이션 코드에서는 쓰지 않는다. IntelliJ도 "Field injection is not recommended" 경고를 띄운다.'],
        rel: ['생성자 주입', '세터 주입'] }
    ]},
    { name: '같은 타입 빈 선택', items: [
      { t: '타입 · 이름 매칭', deep: false,
        d: '스프링은 주입할 빈을 먼저 타입으로 찾고, 후보가 여러 개면 필드·파라미터 이름으로 한 번 더 찾는다.',
        how: [
          '1) 주입 지점의 타입과 맞는 빈을 모두 찾는다. 하위 타입(구현체)도 후보가 된다.',
          '2) 후보가 하나면 그대로 주입한다.',
          '3) 여러 개면 `@Qualifier`, `@Primary` 순서로 확인하고, 그래도 정해지지 않으면 파라미터 이름과 같은 이름의 빈을 고른다.',
          '4) 끝내 하나로 정해지지 않으면 `NoUniqueBeanDefinitionException`, 하나도 없으면 `NoSuchBeanDefinitionException`이 난다.'
        ],
        code: `// KakaoPayClient, TossPayClient 두 빈이 있을 때
public OrderService(PaymentClient tossPayClient) { ... } // 이름이 같은 tossPayClient 빈이 주입된다`,
        warn: ['이름 매칭은 변수 이름 변경에 깨지기 쉽다. 의도를 드러내려면 `@Qualifier`나 `@Primary`를 쓴다.'],
        rel: ['@Primary', '@Qualifier', '컬렉션 주입'] },
      { t: '@Primary', deep: false,
        d: '같은 타입 빈이 여러 개일 때 기본으로 주입할 빈을 지정하는 애너테이션이다.',
        how: [
          '빈 클래스나 `@Bean` 메서드에 붙인다. 별다른 지정이 없는 주입 지점에는 이 빈이 들어간다.',
          '- 쓰임: 대부분 같은 구현을 쓰고 가끔만 다른 구현을 쓸 때. 예: 메인 DB DataSource에 `@Primary`, 보조 DB는 `@Qualifier`로 지정.',
          '- 우선순위: 주입 지점에 `@Qualifier`가 있으면 `@Qualifier`가 이긴다.'
        ],
        code: `@Primary
@Component
public class KakaoPayClient implements PaymentClient { ... }`,
        warn: ['같은 타입에 `@Primary`를 두 개 붙이면 다시 충돌이 난다.'],
        rel: ['@Qualifier', '타입 · 이름 매칭'] },
      { t: '@Qualifier', deep: false,
        d: '빈과 주입 지점에 같은 식별자를 붙여 어떤 빈을 주입할지 명시적으로 고르는 애너테이션이다.',
        how: [
          '빈 쪽과 주입 받는 쪽 양쪽에 같은 값을 붙인다. 빈 이름으로 지정할 수도 있다.',
          '- `@Primary`보다 우선한다. 기본값은 `@Primary`, 예외적인 곳은 `@Qualifier`로 지정하는 조합이 흔하다.',
          '- 문자열 오타는 컴파일 시점에 잡히지 않으므로, 자주 쓰면 `@Qualifier`를 메타 애너테이션으로 감싼 커스텀 애너테이션(`@TossPay`)을 만든다.',
          '- 생성자 주입에서 Lombok `@RequiredArgsConstructor`를 쓰면 필드의 `@Qualifier`가 생성자로 복사되지 않으므로 lombok.config 설정이 필요하다.'
        ],
        code: `@Component
@Qualifier("toss")
public class TossPayClient implements PaymentClient { ... }

public OrderService(@Qualifier("toss") PaymentClient paymentClient) { ... }`,
        rel: ['@Primary', '타입 · 이름 매칭'] },
      { t: '컬렉션 주입', deep: false,
        d: '`List<T>`나 `Map<String, T>`로 받아 같은 타입의 빈 전부를 한 번에 주입받는 방식이다.',
        how: [
          '`List`에는 해당 타입의 모든 빈이, `Map`에는 빈 이름을 키로 모든 빈이 들어간다.',
          '- 전략 패턴 구현에 자주 쓴다. 결제 수단, 할인 정책처럼 구현체가 여러 개이고 실행 시점에 골라야 할 때 유용하다.',
          '- `List`의 순서는 `@Order`나 `Ordered` 인터페이스로 정한다.',
          '- 새 구현체를 추가해도 사용하는 코드를 고칠 필요가 없어 OCP를 지킨다.'
        ],
        code: `@Service
public class PaymentService {
    private final Map<String, PaymentClient> clients;

    public PaymentService(Map<String, PaymentClient> clients) {
        this.clients = clients; // {"kakaoPayClient": ..., "tossPayClient": ...}
    }

    public void pay(String method, long amount) {
        clients.get(method + "PayClient").pay(amount);
    }
}`,
        rel: ['타입 · 이름 매칭'] }
    ]},
    { name: '순환 참조', items: [
      { t: '순환 참조', deep: false,
        d: 'A 빈이 B를 필요로 하고 B가 다시 A를 필요로 해서 어느 쪽도 먼저 만들 수 없는 의존 구조다.',
        how: [
          '생성자 주입이면 A를 만들려면 B가, B를 만들려면 A가 먼저 있어야 해서 생성이 불가능하다. A → B → C → A처럼 여러 단계를 거쳐도 마찬가지다.',
          '스프링 부트 2.6부터 순환 참조가 기본으로 금지되어, 기동 시 `BeanCurrentlyInCreationException`과 함께 순환 경로가 그림으로 출력된다.',
          '- 공통 로직을 제3의 빈으로 추출해 양쪽이 그 빈에 의존하게 한다.',
          '- 한쪽 방향 호출을 이벤트(`ApplicationEventPublisher`)로 바꿔 직접 의존을 끊는다.',
          '- 계층 규칙(Controller → Service → Repository)을 지켜 역방향 의존을 없앤다.'
        ],
        warn: [
          '`spring.main.allow-circular-references=true`로 허용할 수 있지만 권장하지 않는다.',
          '`@Lazy`로 프록시를 주입해 피하는 것은 임시방편이다. 설계를 다시 보라는 신호로 받아들인다.'
        ],
        qa: ['순환 참조는 언제 발견되고 어떻게 해결하나요?', '생성자 주입을 쓰면 애플리케이션 기동 시점에 바로 예외로 드러납니다. 해결은 공통 로직을 별도 빈으로 분리하거나, 이벤트로 의존 방향을 끊거나, 계층 규칙을 지켜 역방향 의존을 없애는 방식으로 합니다.'],
        rel: ['생성자 주입'] }
    ]}
  ],
  must: [
    '실무 표준은 생성자 주입 + `final` 필드 + Lombok `@RequiredArgsConstructor` 조합이다.',
    '빈은 타입으로 먼저 찾고, 후보가 여러 개면 필드·파라미터 이름으로 한 번 더 매칭한다.',
    '`List<T>`나 `Map<String, T>`로 받으면 같은 타입 빈을 전부 주입받을 수 있다. 전략 패턴 구현에 자주 쓴다.',
    '순환 참조는 설계를 다시 보라는 신호다. `@Lazy`로 피하는 것은 임시방편이다.'
  ]
};
