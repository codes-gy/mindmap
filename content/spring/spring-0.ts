import type { Topic } from '../types';

const topic: Topic = {
  key: "spring-0",
  name: "IoC · DI",
  must: [
    "실무 표준은 생성자 주입 + `final` 필드 + Lombok `@RequiredArgsConstructor` 조합이다.",
    "빈은 타입으로 먼저 찾고, 후보가 여러 개면 필드·파라미터 이름으로 한 번 더 매칭한다.",
    "`List<T>`나 `Map<String, T>`로 받으면 같은 타입 빈을 전부 주입받을 수 있다. 전략 패턴 구현에 자주 쓴다.",
    "순환 참조는 설계를 다시 보라는 신호다. `@Lazy`로 피하는 것은 임시방편이다."
  ],
  groups: [
    {
      name: "제어의 역전",
      concepts: [
        {
          id: "spring/ioc-jeeoui-yeokjeon",
          slug: "ioc-jeeoui-yeokjeon",
          title: "IoC (제어의 역전)",
          deep: false,
          def: "객체의 생성, 연결, 생명주기 관리를 개발자 코드가 아니라 프레임워크(스프링 컨테이너)가 맡는 설계 원칙이다.",
          why: "객체 생성과 연결을 각 클래스가 직접 하면 구현을 바꿀 때마다 코드를 고쳐야 하므로, 그 결정을 컨테이너로 옮겨 결합도를 낮추기 위해서다.",
          how: [
            "전통적인 코드에서는 객체가 자신이 쓸 객체를 직접 `new`로 만들고, 언제 생성하고 어떻게 연결할지도 스스로 결정한다. IoC에서는 이 결정권이 컨테이너로 넘어간다.",
            "개발자는 클래스와 의존 관계만 선언하고, 컨테이너가 애플리케이션 시작 시 빈을 만들어 연결한 뒤 필요할 때 개발자 코드를 호출한다.",
            "- 라이브러리: 내 코드가 라이브러리를 호출한다. 흐름의 제어권이 나에게 있다.",
            "- 프레임워크: 프레임워크가 내 코드를 호출한다. 제어권이 프레임워크에 있다.",
            "- IoC를 구현하는 방법에는 DI, 서비스 로케이터, 템플릿 메서드 등이 있고 스프링은 주로 DI를 쓴다."
          ],
          use: [
            "컨트롤러를 직접 생성하지 않아도 DispatcherServlet이 요청에 맞춰 컨트롤러 메서드를 호출해 준다.",
            "`@Scheduled` 메서드를 등록만 하면 스프링이 정해진 시각에 대신 실행한다."
          ],
          myth: [["IoC와 DI는 같은 말이다.", "IoC는 제어권을 넘긴다는 넓은 원칙이고, DI는 그 원칙을 구현하는 여러 방법 중 하나다."]],
          answer: "IoC는 객체의 생성과 연결, 생명주기 관리를 개발자 코드가 아니라 프레임워크가 맡는 원칙입니다. 스프링에서는 컨테이너가 빈을 만들고 연결한 뒤 필요할 때 제 코드를 호출합니다. 덕분에 저는 비즈니스 로직에만 집중할 수 있습니다.",
          analogy: "직접 요리 재료를 사러 다니는 대신, 식당 주방장이 재료를 준비해 두고 요리사는 요리만 하는 구조와 같습니다.",
          qa: [
            "IoC와 DI는 어떤 관계인가요?",
            "IoC는 제어권을 프레임워크로 넘긴다는 넓은 원칙이고, DI는 그 원칙을 구현하는 구체적인 방법 중 하나입니다. 스프링은 객체가 필요한 의존성을 컨테이너가 외부에서 넣어 주는 DI 방식으로 IoC를 실현합니다."
          ],
          followUps: [
            [
              "라이브러리와 프레임워크의 차이는 무엇인가요?",
              "라이브러리는 제 코드가 필요할 때 호출해 쓰는 도구이고, 프레임워크는 전체 흐름을 쥐고 제 코드를 호출합니다. 흐름의 제어권이 누구에게 있는지가 핵심 차이이고, 프레임워크 쪽이 IoC에 해당합니다."
            ]
          ],
          related: ["spring/di-uijonseong-juip"]
        }
      ]
    },
    {
      name: "의존성 주입 방식",
      compare: {
        cols: ["기준", "생성자 주입", "세터 주입", "필드 주입"],
        rows: [
          ["주입 시점", "객체 생성과 동시에", "생성 후 setter 호출", "생성 후 리플렉션"],
          ["final 사용", "가능", "불가", "불가"],
          ["스프링 없이 테스트", "쉬움 (new로 생성)", "가능 (setter 호출)", "어려움"],
          ["누락 발견 시점", "기동 시점", "사용 시점 (NPE)", "사용 시점 (NPE)"],
          ["주로 쓰는 곳", "필수 의존성 (기본)", "선택적 의존성", "테스트 코드"]
        ]
      },
      concepts: [
        {
          id: "spring/di-uijonseong-juip",
          slug: "di-uijonseong-juip",
          title: "DI (의존성 주입)",
          deep: true,
          def: "객체가 필요로 하는 의존 객체를 내부에서 만들지 않고 외부(컨테이너)에서 넣어 받는 방식이다.",
          why: "클래스가 구현체를 직접 `new`로 만들면 교체와 테스트가 어려우므로, 인터페이스에만 의존하고 구현은 외부에서 바꿔 끼우기 위해서다.",
          how: [
            "1) 개발자는 클래스가 필요로 하는 의존성을 생성자 파라미터(또는 setter, 필드)로 선언한다.",
            "2) 컨테이너가 기동 시 빈 정의를 읽고 의존 관계 그래프를 만든다.",
            "3) 의존 대상 빈을 먼저 만들고, 이를 생성자 인자로 넘겨 빈을 생성한다.",
            "4) 완성된 빈을 싱글톤으로 보관하고 필요한 다른 빈에 주입한다.",
            "클래스는 구체 구현이 아니라 인터페이스에만 의존하고, 어떤 구현체를 넣을지는 설정이 결정한다.",
            "예를 들어 `OrderService`가 `new JdbcOrderRepository()`를 직접 만들면 JPA로 바꿀 때 서비스 코드를 고쳐야 한다. `OrderRepository` 인터페이스를 주입받으면 서비스 코드는 그대로 두고 구현체만 바꾼다.",
            "- 결합도 감소: 구현체 교체가 설정 변경만으로 가능하다(OCP).",
            "- 테스트 용이성: 테스트에서 가짜(Mock) 객체를 쉽게 끼워 넣는다.",
            "- 책임 분리: 사용하는 코드는 사용에만 집중하고 생성과 조립은 컨테이너가 맡는다."
          ],
          code: "public interface OrderRepository {\n    Order save(Order order);\n}\n\n@Repository\npublic class JpaOrderRepository implements OrderRepository { /* ... */ }\n\n@Service\npublic class OrderService {\n    private final OrderRepository orderRepository; // 인터페이스에만 의존한다\n\n    public OrderService(OrderRepository orderRepository) { // 컨테이너가 구현체를 넣어 준다\n        this.orderRepository = orderRepository;\n    }\n}",
          codeLang: "java",
          use: [
            "결제 대행사를 바꿀 때 `PaymentClient` 구현체 빈만 교체하고 서비스 코드는 그대로 둔다.",
            "단위 테스트에서 실제 `OrderRepository` 대신 Mockito 목을 생성자로 넣는다."
          ],
          answer: "DI는 객체가 필요한 의존 객체를 직접 만들지 않고 외부에서 넣어 받는 방식입니다. 클래스는 인터페이스에만 의존하고 어떤 구현을 넣을지는 컨테이너 설정이 결정합니다. 그래서 구현을 바꿔도 사용하는 코드를 고칠 필요가 없고 테스트에서 목 객체를 넣기도 쉽습니다.",
          analogy: "노트북이 특정 충전기를 내장하는 대신 USB-C 포트만 두면, 어떤 충전기든 꽂아 쓸 수 있는 것과 같습니다.",
          qa: [
            "DI를 쓰면 무엇이 좋아지나요?",
            "구현체 대신 인터페이스에 의존하므로 결합도가 낮아져 구현을 바꿔도 사용하는 코드를 고칠 필요가 없습니다. 테스트에서 목 객체를 주입하기도 쉬워집니다."
          ],
          followUps: [
            [
              "DI가 없으면 테스트가 왜 어려워지나요?",
              "클래스 안에서 의존 객체를 new로 직접 만들면 테스트에서 그 객체를 가짜로 바꿀 방법이 없습니다. 그래서 실제 DB나 외부 API까지 함께 호출하게 되어 느리고 불안정한 테스트가 됩니다."
            ]
          ],
          related: ["spring/ioc-jeeoui-yeokjeon", "spring/saengseongja-juip"]
        },
        {
          id: "spring/saengseongja-juip",
          slug: "saengseongja-juip",
          title: "생성자 주입",
          deep: true,
          def: "생성자 파라미터로 의존성을 받는 방식으로, 스프링 공식 문서가 권장하는 기본 주입 방법이다.",
          why: "의존성 없이는 객체 자체를 만들 수 없게 강제해, 누락과 변경 가능성을 원천적으로 막기 위해서다. 스프링 없이도 순수 자바로 테스트할 수 있다.",
          how: [
            "생성자가 하나뿐이면 `@Autowired`를 생략해도 스프링이 그 생성자로 주입한다(스프링 4.3+).",
            "1) 컨테이너가 빈을 만들 때 생성자 파라미터 타입에 맞는 빈을 찾는다.",
            "2) 찾은 빈들을 인자로 생성자를 호출해 객체를 만든다. 생성과 주입이 한 번에 끝난다.",
            "3) 필요한 빈이 없거나 여러 개면 기동 시점에 바로 예외가 나 애플리케이션이 뜨지 않는다.",
            "- 불변성: 필드를 `final`로 선언할 수 있어 생성 후 바뀌지 않는다.",
            "- 누락 방지: 필수 의존성 없이는 객체를 만들 수 없다. 필드 주입은 null로 실행되다 NPE가 난다.",
            "- 테스트 편의: `new OrderService(mockRepo)`로 스프링 없이 단위 테스트할 수 있다.",
            "- 순환 참조 조기 발견: 서로를 생성자로 요구하면 기동 시 오류로 드러난다."
          ],
          flow: ["빈 생성 요청", "생성자 파라미터 타입 확인", "타입에 맞는 빈 조회", "빈을 인자로 생성자 호출", "생성과 주입 동시 완료"],
          code: "@Service\n@RequiredArgsConstructor // Lombok이 final 필드로 생성자를 만들어 준다\npublic class OrderService {\n\n    private final OrderRepository orderRepository;\n    private final PaymentClient paymentClient;\n\n    // Lombok 없이 쓰면 아래와 같다 (생성자가 하나라 @Autowired 생략)\n    // public OrderService(OrderRepository orderRepository, PaymentClient paymentClient) {\n    //     this.orderRepository = orderRepository;\n    //     this.paymentClient = paymentClient;\n    // }\n}\n\n// 테스트: 스프링 없이 바로 생성\nOrderService service = new OrderService(mock(OrderRepository.class), mock(PaymentClient.class));",
          codeLang: "java",
          use: [
            "서비스 클래스에 `private final` 필드와 Lombok `@RequiredArgsConstructor`를 함께 쓰는 것이 팀 표준인 경우가 많다.",
            "테스트에서 `new OrderService(mockRepo, mockClient)`로 의존성을 직접 넣어 빠르게 검증한다."
          ],
          warn: [
            "생성자 파라미터가 지나치게 많아지면 그 클래스의 책임이 너무 많다는 신호다. 분리를 고려한다.",
            "생성자가 여러 개면 어떤 생성자를 쓸지 `@Autowired`로 명시해야 한다.",
            "생성자 안에서 무거운 초기화(외부 호출)를 하지 않는다. 초기화 콜백으로 옮긴다."
          ],
          myth: [
            ["생성자 주입을 쓰려면 반드시 @Autowired를 붙여야 한다.", "생성자가 하나뿐이면 스프링 4.3부터 생략해도 자동으로 주입된다."],
            ["생성자 주입이면 순환 참조가 해결된다.", "해결되는 것이 아니라 기동 시점에 바로 드러날 뿐이다. 설계를 고쳐야 한다."]
          ],
          answer: "생성자 주입은 생성자 파라미터로 의존성을 받는 방식이고 스프링이 공식적으로 권장합니다. 필드를 final로 둘 수 있어 불변이 보장되고, 필수 의존성이 없으면 객체 생성 자체가 실패해 기동 시점에 바로 문제를 발견합니다. 또 스프링 없이 new로 객체를 만들어 단위 테스트할 수 있습니다.",
          qa: [
            "필드 주입 대신 생성자 주입을 권장하는 이유는?",
            "생성자 주입은 필드를 final로 둘 수 있어 불변이 보장되고, 필수 의존성이 없으면 객체 생성 자체가 실패해 누락을 기동 시점에 발견할 수 있습니다. 또 스프링 없이 new로 객체를 만들어 테스트할 수 있고, 순환 참조도 기동 시 바로 드러납니다. 그래서 스프링 공식 문서도 생성자 주입을 기본으로 권장합니다."
          ],
          followUps: [
            [
              "Lombok @RequiredArgsConstructor는 어떤 생성자를 만드나요?",
              "final 필드와 @NonNull이 붙은 필드만 파라미터로 받는 생성자를 만듭니다. 생성자가 하나만 생기므로 스프링이 @Autowired 없이 그 생성자로 주입합니다."
            ],
            [
              "생성자 파라미터가 10개라면 어떻게 하시겠어요?",
              "그 클래스가 너무 많은 책임을 가졌다는 신호로 보고 역할별로 클래스를 나누겠습니다. 주입 방식을 바꿔 숨기는 것은 근본 해결이 아니라고 생각합니다."
            ],
            [
              "생성자가 여러 개면 스프링은 무엇을 쓰나요?",
              "어떤 생성자를 쓸지 모호하므로 주입에 쓸 생성자에 @Autowired를 붙여 명시해야 합니다. 명시하지 않으면 기본 생성자를 찾고, 없으면 오류가 납니다."
            ]
          ],
          related: ["spring/seteo-juip", "spring/pildeu-juip", "spring/sunhwan-chamjo"]
        },
        {
          id: "spring/seteo-juip",
          slug: "seteo-juip",
          title: "세터 주입",
          deep: false,
          def: "`@Autowired`를 붙인 setter 메서드로 객체 생성 이후에 의존성을 넣는 방식이다.",
          why: "빈이 없어도 동작해야 하는 선택적 의존성이나 생성 후 바꿔야 하는 의존성을 다루기 위해서다.",
          how: [
            "컨테이너가 기본 생성자로 객체를 먼저 만들고, 그 뒤 setter를 호출해 의존성을 넣는다.",
            "- 선택적 의존성: `@Autowired(required = false)`로 빈이 없어도 기동되게 할 수 있다.",
            "- 변경 가능성: 실행 중 의존성을 바꿔야 하는 드문 경우에 쓴다.",
            "- 단점: setter가 public이라 누구나 바꿀 수 있고, 주입 전에는 필드가 null이다. `final`을 쓸 수 없다."
          ],
          code: "@Service\npublic class NotificationService {\n    private SmsSender smsSender;\n\n    @Autowired(required = false) // SmsSender 빈이 없어도 기동된다\n    public void setSmsSender(SmsSender smsSender) {\n        this.smsSender = smsSender;\n    }\n}",
          codeLang: "java",
          use: ["SMS 발송 빈이 있는 환경에서만 문자를 보내도록 `@Autowired(required = false)` setter로 받는다."],
          warn: ["필수 의존성에는 세터 주입을 쓰지 않는다. 생성자 주입이 기본이다."],
          answer: "세터 주입은 객체를 먼저 만든 뒤 @Autowired가 붙은 setter로 의존성을 넣는 방식입니다. 빈이 없어도 기동되게 하는 선택적 의존성이나 실행 중 바꿔야 하는 의존성에 씁니다. 다만 필수 의존성에는 null 위험이 있어 생성자 주입을 씁니다.",
          followUps: [
            [
              "@Autowired(required = false)와 Optional 주입의 차이는?",
              "required = false는 빈이 없으면 setter 자체를 호출하지 않고, Optional<T>로 받으면 빈이 없을 때 Optional.empty()가 들어옵니다. 생성자 주입에서도 쓸 수 있어 Optional이나 ObjectProvider 방식을 더 많이 씁니다."
            ]
          ],
          related: ["spring/saengseongja-juip", "spring/pildeu-juip"]
        },
        {
          id: "spring/pildeu-juip",
          slug: "pildeu-juip",
          title: "필드 주입",
          deep: false,
          def: "필드에 `@Autowired`를 직접 붙여 리플렉션으로 의존성을 넣는 방식이다.",
          why: "생성자나 setter 없이 가장 짧은 코드로 의존성을 받을 수 있지만, 그 편의가 테스트와 불변성을 희생한다는 점을 알기 위해서다.",
          how: [
            "코드가 가장 짧지만, 값은 스프링이 리플렉션으로만 넣을 수 있다.",
            "- 테스트 어려움: 스프링 없이 객체를 만들면 필드가 null이라 목 객체를 넣을 방법이 없다.",
            "- `final` 불가: 생성 후 주입되므로 불변으로 만들 수 없다.",
            "- 의존성 은닉: 생성자에 드러나지 않아 클래스가 무엇에 의존하는지, 얼마나 많이 의존하는지 보이지 않는다.",
            "테스트 클래스(`@SpringBootTest` 안의 필드)에서는 편의상 써도 괜찮다."
          ],
          use: ["`@SpringBootTest` 테스트 클래스에서 검증 대상 빈을 `@Autowired` 필드로 받는다."],
          warn: ["애플리케이션 코드에서는 쓰지 않는다. IntelliJ도 \"Field injection is not recommended\" 경고를 띄운다."],
          myth: [["필드 주입은 동작이 다르거나 느리다.", "주입 결과는 같다. 문제는 성능이 아니라 테스트 어려움과 불변성 부족이다."]],
          answer: "필드 주입은 필드에 @Autowired를 직접 붙이는 방식으로 코드는 가장 짧습니다. 하지만 리플렉션으로만 값을 넣을 수 있어 스프링 없이 테스트하기 어렵고 final을 쓸 수 없으며, 의존성이 겉으로 드러나지 않습니다. 그래서 애플리케이션 코드에서는 쓰지 않고 테스트 클래스 정도에서만 씁니다.",
          followUps: [
            [
              "필드 주입된 클래스를 단위 테스트하려면 어떻게 하나요?",
              "스프링 컨테이너를 띄우거나, Mockito의 @InjectMocks처럼 리플렉션으로 넣어 주는 도구를 써야 합니다. 그 자체가 설계가 테스트 친화적이지 않다는 신호라 생성자 주입으로 바꾸는 것이 낫습니다."
            ]
          ],
          related: ["spring/saengseongja-juip", "spring/seteo-juip"]
        }
      ]
    },
    {
      name: "같은 타입 빈 선택",
      compare: {
        cols: ["기준", "@Primary", "@Qualifier", "컬렉션 주입"],
        rows: [
          ["붙이는 곳", "빈 쪽", "빈과 주입 지점", "주입 지점 타입"],
          ["주입되는 빈", "기본 빈 1개", "지정한 빈 1개", "같은 타입 전부"],
          ["우선순위", "@Qualifier보다 낮음", "가장 높음", "충돌 자체가 없음"],
          ["대표 쓰임", "메인 DataSource", "보조 DB, 특정 구현", "전략 패턴"]
        ]
      },
      concepts: [
        {
          id: "spring/taip-ireum-maeching",
          slug: "taip-ireum-maeching",
          title: "타입 · 이름 매칭",
          deep: false,
          def: "스프링은 주입할 빈을 먼저 타입으로 찾고, 후보가 여러 개면 필드·파라미터 이름으로 한 번 더 찾는다.",
          why: "같은 타입 빈이 여러 개일 때 스프링이 어떤 빈을 고르는지 알아야 `NoUniqueBeanDefinitionException`을 이해하고 피할 수 있기 때문이다.",
          how: [
            "1) 주입 지점의 타입과 맞는 빈을 모두 찾는다. 하위 타입(구현체)도 후보가 된다.",
            "2) 후보가 하나면 그대로 주입한다.",
            "3) 여러 개면 `@Qualifier`, `@Primary` 순서로 확인하고, 그래도 정해지지 않으면 파라미터 이름과 같은 이름의 빈을 고른다.",
            "4) 끝내 하나로 정해지지 않으면 `NoUniqueBeanDefinitionException`, 하나도 없으면 `NoSuchBeanDefinitionException`이 난다."
          ],
          flow: ["주입 지점 타입 확인", "타입이 맞는 빈 전부 조회", "1개면 바로 주입", "@Qualifier 확인", "@Primary 확인", "파라미터 이름으로 매칭", "실패 시 예외"],
          code: "// KakaoPayClient, TossPayClient 두 빈이 있을 때\npublic OrderService(PaymentClient tossPayClient) { ... } // 이름이 같은 tossPayClient 빈이 주입된다",
          codeLang: "java",
          use: ["결제 구현체가 둘인데 오류가 나면 `@Primary`를 붙여 기본 구현을 정한다."],
          warn: ["이름 매칭은 변수 이름 변경에 깨지기 쉽다. 의도를 드러내려면 `@Qualifier`나 `@Primary`를 쓴다."],
          answer: "스프링은 주입할 빈을 먼저 타입으로 찾고, 후보가 여러 개면 @Qualifier, @Primary를 본 뒤 마지막으로 파라미터 이름과 같은 이름의 빈을 고릅니다. 그래도 하나로 정해지지 않으면 NoUniqueBeanDefinitionException이 납니다. 이름 매칭은 변수명 변경에 깨지기 쉬워 의도를 드러내려면 애너테이션을 씁니다.",
          followUps: [
            [
              "NoSuchBeanDefinitionException과 NoUniqueBeanDefinitionException의 차이는?",
              "앞의 것은 주입할 타입의 빈이 하나도 없을 때, 뒤의 것은 후보가 여러 개인데 하나로 고를 수 없을 때 납니다. 앞은 등록 누락이나 스캔 범위를, 뒤는 @Primary나 @Qualifier 지정을 확인합니다."
            ]
          ],
          related: ["spring/primary", "spring/qualifier", "spring/keolreksyeon-juip"]
        },
        {
          id: "spring/primary",
          slug: "primary",
          title: "@Primary",
          deep: false,
          def: "같은 타입 빈이 여러 개일 때 기본으로 주입할 빈을 지정하는 애너테이션이다.",
          why: "같은 타입 빈이 여러 개여도 주입 지점마다 일일이 지정하지 않고 기본 빈 하나를 정해 두기 위해서다.",
          how: [
            "빈 클래스나 `@Bean` 메서드에 붙인다. 별다른 지정이 없는 주입 지점에는 이 빈이 들어간다.",
            "- 쓰임: 대부분 같은 구현을 쓰고 가끔만 다른 구현을 쓸 때. 예: 메인 DB DataSource에 `@Primary`, 보조 DB는 `@Qualifier`로 지정.",
            "- 우선순위: 주입 지점에 `@Qualifier`가 있으면 `@Qualifier`가 이긴다."
          ],
          code: "@Primary\n@Component\npublic class KakaoPayClient implements PaymentClient { ... }",
          codeLang: "java",
          use: ["메인 DB DataSource에 `@Primary`를 붙이고, 통계용 DB는 `@Qualifier(\"statsDataSource\")`로 지정해 쓴다."],
          warn: ["같은 타입에 `@Primary`를 두 개 붙이면 다시 충돌이 난다."],
          answer: "@Primary는 같은 타입 빈이 여러 개일 때 기본으로 주입할 빈을 지정합니다. 별도 지정이 없는 주입 지점에는 이 빈이 들어가고, @Qualifier가 있는 곳은 @Qualifier가 우선합니다. 대부분 같은 구현을 쓰고 가끔 다른 구현을 쓸 때 편합니다.",
          analogy: "팀의 기본 담당자를 정해 두고, 특별한 일만 다른 사람을 지명하는 것과 같습니다.",
          followUps: [
            [
              "@Primary와 @Qualifier가 동시에 있으면 무엇이 주입되나요?",
              "주입 지점에 @Qualifier가 있으면 그 지정이 우선합니다. @Primary는 아무 지정이 없을 때 쓰이는 기본값입니다."
            ]
          ],
          related: ["spring/qualifier", "spring/taip-ireum-maeching"]
        },
        {
          id: "spring/qualifier",
          slug: "qualifier",
          title: "@Qualifier",
          deep: false,
          def: "빈과 주입 지점에 같은 식별자를 붙여 어떤 빈을 주입할지 명시적으로 고르는 애너테이션이다.",
          why: "같은 타입 빈이 여러 개일 때 특정 주입 지점에 원하는 빈을 명시적으로 골라 넣기 위해서다.",
          how: [
            "빈 쪽과 주입 받는 쪽 양쪽에 같은 값을 붙인다. 빈 이름으로 지정할 수도 있다.",
            "- `@Primary`보다 우선한다. 기본값은 `@Primary`, 예외적인 곳은 `@Qualifier`로 지정하는 조합이 흔하다.",
            "- 문자열 오타는 컴파일 시점에 잡히지 않으므로, 자주 쓰면 `@Qualifier`를 메타 애너테이션으로 감싼 커스텀 애너테이션(`@TossPay`)을 만든다.",
            "- 생성자 주입에서 Lombok `@RequiredArgsConstructor`를 쓰면 필드의 `@Qualifier`가 생성자로 복사되지 않으므로 lombok.config 설정이 필요하다."
          ],
          code: "@Component\n@Qualifier(\"toss\")\npublic class TossPayClient implements PaymentClient { ... }\n\npublic OrderService(@Qualifier(\"toss\") PaymentClient paymentClient) { ... }",
          codeLang: "java",
          use: [
            "`@Qualifier(\"toss\")`로 토스 결제 클라이언트를 특정 서비스에만 주입한다.",
            "오타를 막으려고 `@Qualifier`를 메타 애너테이션으로 쓴 `@TossPay` 애너테이션을 만든다."
          ],
          myth: [
            [
              "Lombok @RequiredArgsConstructor를 쓰면 필드의 @Qualifier가 그대로 적용된다.",
              "기본 설정에서는 생성자 파라미터로 복사되지 않는다. lombok.config에 copyableAnnotations 설정이 필요하다."
            ]
          ],
          answer: "@Qualifier는 빈과 주입 지점에 같은 식별자를 붙여 어떤 빈을 넣을지 명시적으로 고르는 방법입니다. @Primary보다 우선순위가 높습니다. 문자열 오타가 컴파일 시점에 잡히지 않아 자주 쓰면 커스텀 애너테이션으로 감쌉니다.",
          followUps: [
            [
              "@Qualifier 대신 빈 이름으로 매칭하면 안 되나요?",
              "동작은 하지만 변수 이름을 바꾸는 리팩터링 한 번에 다른 빈이 주입되거나 오류가 날 수 있습니다. 의도를 코드로 명확히 드러내려면 @Qualifier가 더 안전합니다."
            ]
          ],
          related: ["spring/primary", "spring/taip-ireum-maeching"]
        },
        {
          id: "spring/keolreksyeon-juip",
          slug: "keolreksyeon-juip",
          title: "컬렉션 주입",
          deep: false,
          def: "`List<T>`나 `Map<String, T>`로 받아 같은 타입의 빈 전부를 한 번에 주입받는 방식이다.",
          why: "구현체가 늘어날 때마다 주입 코드를 고치지 않고, 모든 구현을 받아 실행 시점에 골라 쓰는 전략 패턴을 만들기 위해서다.",
          how: [
            "`List`에는 해당 타입의 모든 빈이, `Map`에는 빈 이름을 키로 모든 빈이 들어간다.",
            "- 전략 패턴 구현에 자주 쓴다. 결제 수단, 할인 정책처럼 구현체가 여러 개이고 실행 시점에 골라야 할 때 유용하다.",
            "- `List`의 순서는 `@Order`나 `Ordered` 인터페이스로 정한다.",
            "- 새 구현체를 추가해도 사용하는 코드를 고칠 필요가 없어 OCP를 지킨다."
          ],
          code: "@Service\npublic class PaymentService {\n    private final Map<String, PaymentClient> clients;\n\n    public PaymentService(Map<String, PaymentClient> clients) {\n        this.clients = clients; // {\"kakaoPayClient\": ..., \"tossPayClient\": ...}\n    }\n\n    public void pay(String method, long amount) {\n        clients.get(method + \"PayClient\").pay(amount);\n    }\n}",
          codeLang: "java",
          use: [
            "`Map<String, PaymentClient>`로 결제 수단 코드에 맞는 클라이언트를 골라 호출한다.",
            "`List<OrderValidator>`로 모든 주문 검증기를 `@Order` 순서대로 실행한다."
          ],
          answer: "List나 Map 타입으로 받으면 같은 타입의 빈 전부를 한 번에 주입받을 수 있습니다. Map은 빈 이름을 키로 갖기 때문에 실행 시점에 구현을 골라야 하는 전략 패턴에 자주 씁니다. 새 구현을 추가해도 사용하는 코드를 고칠 필요가 없어 OCP를 지킵니다.",
          followUps: [
            [
              "List로 주입받을 때 순서는 어떻게 정해지나요?",
              "기본적으로 보장되지 않고, @Order 애너테이션이나 Ordered 인터페이스로 순서를 지정합니다. 값이 작을수록 앞에 옵니다."
            ]
          ],
          related: ["spring/taip-ireum-maeching"]
        }
      ]
    },
    {
      name: "순환 참조",
      concepts: [
        {
          id: "spring/sunhwan-chamjo",
          slug: "sunhwan-chamjo",
          title: "순환 참조",
          deep: false,
          def: "A 빈이 B를 필요로 하고 B가 다시 A를 필요로 해서 어느 쪽도 먼저 만들 수 없는 의존 구조다.",
          why: "서로를 필요로 하는 빈은 생성 자체가 불가능해 기동이 실패하므로, 원인을 알고 설계 단계에서 의존 방향을 끊기 위해서다.",
          how: [
            "생성자 주입이면 A를 만들려면 B가, B를 만들려면 A가 먼저 있어야 해서 생성이 불가능하다. A → B → C → A처럼 여러 단계를 거쳐도 마찬가지다.",
            "스프링 부트 2.6부터 순환 참조가 기본으로 금지되어, 기동 시 `BeanCurrentlyInCreationException`과 함께 순환 경로가 그림으로 출력된다.",
            "- 공통 로직을 제3의 빈으로 추출해 양쪽이 그 빈에 의존하게 한다.",
            "- 한쪽 방향 호출을 이벤트(`ApplicationEventPublisher`)로 바꿔 직접 의존을 끊는다.",
            "- 계층 규칙(Controller → Service → Repository)을 지켜 역방향 의존을 없앤다."
          ],
          flow: ["A 빈 생성 시작", "A 생성자가 B 요구", "B 빈 생성 시작", "B 생성자가 A 요구", "A는 아직 생성 중", "예외 발생"],
          use: ["회원 서비스와 포인트 서비스가 서로 호출하면, 포인트 적립을 회원 가입 이벤트 리스너로 바꿔 의존을 끊는다."],
          warn: [
            "`spring.main.allow-circular-references=true`로 허용할 수 있지만 권장하지 않는다.",
            "`@Lazy`로 프록시를 주입해 피하는 것은 임시방편이다. 설계를 다시 보라는 신호로 받아들인다."
          ],
          myth: [["@Lazy를 붙이면 문제가 해결된 것이다.", "프록시로 생성 시점을 미뤘을 뿐 서로 의존하는 설계는 그대로다. 임시방편이다."]],
          answer: "순환 참조는 A가 B를, B가 다시 A를 필요로 해서 어느 쪽도 먼저 만들 수 없는 구조입니다. 스프링 부트 2.6부터 기본으로 금지되어 기동 시 순환 경로와 함께 예외가 납니다. 공통 로직을 별도 빈으로 분리하거나 이벤트로 의존 방향을 끊어 해결합니다.",
          analogy: "두 사람이 서로 상대가 먼저 문을 열어 주기를 기다리며 아무도 들어가지 못하는 상황입니다.",
          qa: [
            "순환 참조는 언제 발견되고 어떻게 해결하나요?",
            "생성자 주입을 쓰면 애플리케이션 기동 시점에 바로 예외로 드러납니다. 해결은 공통 로직을 별도 빈으로 분리하거나, 이벤트로 의존 방향을 끊거나, 계층 규칙을 지켜 역방향 의존을 없애는 방식으로 합니다."
          ],
          followUps: [
            [
              "필드 주입에서는 왜 예전에 순환 참조가 허용됐나요?",
              "필드·세터 주입은 객체를 먼저 만들고 나중에 주입하므로, 스프링이 생성 중인 빈을 미리 노출하는 방식으로 연결할 수 있었습니다. 하지만 버그를 숨긴다는 이유로 부트 2.6부터 기본 금지가 되었습니다."
            ]
          ],
          related: ["spring/saengseongja-juip"]
        }
      ]
    }
  ]
};

export default topic;
