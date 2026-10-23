import type { Topic } from '../types';

const topic: Topic = {
  key: "spring-1",
  name: "Bean · 컨테이너",
  must: [
    "싱글톤 빈에 요청마다 바뀌는 값을 필드로 두지 않는다. 가장 흔한 동시성 버그다.",
    "싱글톤에 주입한 prototype 빈은 처음 한 번만 만들어진다. 매번 새로 받으려면 `ObjectProvider`를 쓴다.",
    "prototype 빈은 컨테이너가 소멸을 관리하지 않아 `@PreDestroy`가 호출되지 않는다.",
    "`@PostConstruct` 안에서는 아직 프록시가 적용되지 않아 `@Transactional`이 동작하지 않는다."
  ],
  groups: [
    {
      name: "스프링 컨테이너",
      compare: {
        cols: ["기준", "BeanFactory", "ApplicationContext"],
        rows: [
          ["관계", "최상위 인터페이스", "BeanFactory 상속"],
          ["싱글톤 생성 시점", "처음 요청할 때", "기동 시점에 미리"],
          ["부가 기능", "빈 생성·조회만", "이벤트, 메시지, 환경 정보"],
          ["실무 사용", "직접 쓰는 일 드묾", "사실상 기본 컨테이너"]
        ]
      },
      concepts: [
        {
          id: "spring/beanfactory",
          slug: "beanfactory",
          title: "BeanFactory",
          deep: false,
          def: "스프링 컨테이너의 최상위 인터페이스로, 빈을 등록하고 `getBean()`으로 조회하는 핵심 기능만 가진다.",
          why: "빈을 등록하고 조회하는 컨테이너의 가장 기본 계약을 이해해야 ApplicationContext가 무엇을 더했는지 구분할 수 있기 때문이다.",
          how: [
            "빈 정의(BeanDefinition)를 보관하고, 요청이 오면 빈을 만들어 의존성을 주입한 뒤 돌려준다.",
            "- 지연 로딩: 빈을 처음 요청할 때 만든다. 그래서 설정 오류가 실제 사용 시점에야 드러날 수 있다.",
            "- 대표 구현체는 `DefaultListableBeanFactory`이며, ApplicationContext도 내부에서 이것을 사용한다.",
            "실무에서 BeanFactory를 직접 쓰는 일은 거의 없고, 부가 기능이 더해진 ApplicationContext를 쓴다."
          ],
          use: ["직접 쓰기보다는 `DefaultListableBeanFactory`가 ApplicationContext 내부에서 빈 저장소로 동작한다."],
          answer: "BeanFactory는 스프링 컨테이너의 최상위 인터페이스로 빈을 등록하고 조회하는 핵심 기능만 가집니다. 빈을 처음 요청할 때 만드는 지연 로딩 방식이라 설정 오류가 늦게 드러날 수 있습니다. 실무에서는 이를 확장한 ApplicationContext를 씁니다.",
          qa: [
            "BeanFactory와 ApplicationContext의 차이는?",
            "BeanFactory는 빈 생성과 조회만 하는 최소 컨테이너이고 빈을 처음 요청할 때 만듭니다. ApplicationContext는 이를 상속해 이벤트, 메시지, 환경 정보 같은 기능을 더하고 싱글톤을 기동 시점에 미리 만들어 설정 오류를 빨리 발견합니다."
          ],
          followUps: [
            [
              "빈을 지연 로딩하고 싶다면 ApplicationContext에서 어떻게 하나요?",
              "빈에 @Lazy를 붙이면 처음 사용될 때 생성됩니다. 부트에서는 spring.main.lazy-initialization=true로 전체를 지연시킬 수 있지만, 설정 오류를 늦게 발견하게 됩니다."
            ]
          ],
          related: ["spring/applicationcontext"]
        },
        {
          id: "spring/applicationcontext",
          slug: "applicationcontext",
          title: "ApplicationContext",
          deep: false,
          def: "BeanFactory를 상속하고 애플리케이션 개발에 필요한 부가 기능을 더한 스프링 컨테이너로, 보통 \"스프링 컨테이너\"라고 하면 이것을 말한다.",
          why: "빈 관리만으로는 부족한 국제화, 이벤트, 환경 설정, 리소스 로딩 같은 애플리케이션 기능을 한 컨테이너에서 쓰기 위해서다.",
          how: [
            "- MessageSource: 국제화(i18n) 메시지 처리",
            "- ApplicationEventPublisher: 이벤트 발행과 `@EventListener` 구독",
            "- Environment: 프로필, 프로퍼티 같은 환경 정보",
            "- ResourceLoader: 클래스패스, 파일, URL 리소스 읽기",
            "싱글톤 빈을 기동 시점에 미리 모두 만든다(즉시 로딩). 그래서 의존성 누락 같은 설정 오류를 애플리케이션 시작 단계에서 발견할 수 있다.",
            "스프링 부트 웹 애플리케이션은 `AnnotationConfigServletWebServerApplicationContext`를 쓴다."
          ],
          use: [
            "`ApplicationEventPublisher`로 주문 완료 이벤트를 발행하고 `@EventListener`로 알림을 보낸다.",
            "`Environment`로 현재 활성 프로필을 확인해 동작을 나눈다."
          ],
          answer: "ApplicationContext는 BeanFactory를 상속하고 이벤트 발행, 메시지 처리, 환경 정보, 리소스 로딩 같은 기능을 더한 컨테이너입니다. 보통 스프링 컨테이너라고 하면 이것을 말합니다. 싱글톤 빈을 기동 시점에 미리 만들어 설정 오류를 시작 단계에서 발견할 수 있습니다.",
          analogy: "BeanFactory가 창고라면 ApplicationContext는 창고에 안내 데스크, 방송 시설, 설정 게시판까지 갖춘 물류 센터입니다.",
          followUps: [
            [
              "스프링 부트 웹 애플리케이션은 어떤 ApplicationContext를 쓰나요?",
              "서블릿 기반이면 AnnotationConfigServletWebServerApplicationContext를 씁니다. 컨테이너를 만들면서 내장 톰캣도 함께 띄웁니다."
            ]
          ],
          related: ["spring/beanfactory", "spring/keomponeonteu-seukaen"]
        }
      ]
    },
    {
      name: "빈 등록",
      compare: {
        cols: ["기준", "컴포넌트 스캔", "@Bean 수동 등록"],
        rows: [
          ["등록 방법", "클래스에 @Component", "설정 클래스 메서드에 @Bean"],
          ["빈 이름", "클래스명 첫 글자 소문자", "메서드 이름"],
          ["대상", "직접 만든 클래스", "외부 라이브러리 객체"],
          ["장점", "설정 코드가 거의 없음", "생성 과정을 세밀하게 제어"]
        ]
      },
      concepts: [
        {
          id: "spring/keomponeonteu-seukaen",
          slug: "keomponeonteu-seukaen",
          title: "컴포넌트 스캔",
          deep: false,
          def: "`@Component`가 붙은 클래스를 지정한 패키지에서 찾아 자동으로 빈으로 등록하는 기능이다.",
          why: "빈이 수백 개일 때 설정 파일에 하나하나 등록하는 반복 작업과 누락을 없애기 위해서다.",
          how: [
            "`@ComponentScan`이 기준 패키지와 하위 패키지를 훑어 `@Component`(와 이를 포함한 애너테이션)가 붙은 클래스를 찾는다.",
            "- 스프링 부트에서는 `@SpringBootApplication`에 포함되어 있어, 이 클래스가 있는 패키지가 스캔 기준이 된다. 그래서 메인 클래스는 최상위 패키지에 둔다.",
            "- 빈 이름은 클래스 이름의 첫 글자를 소문자로 바꾼 것이다(`OrderService` → `orderService`).",
            "- `includeFilters`, `excludeFilters`로 대상을 조정할 수 있다.",
            "직접 만든 비즈니스 로직 클래스는 컴포넌트 스캔으로 등록하는 것이 일반적이다."
          ],
          flow: ["기준 패키지 결정", "하위 패키지 클래스 탐색", "@Component 여부 확인", "빈 이름 생성", "빈 정의 등록"],
          use: ["`com.shop` 패키지에 메인 클래스를 두어 `com.shop.order`, `com.shop.member`가 모두 스캔되게 한다."],
          warn: ["메인 클래스보다 상위나 다른 패키지에 있는 클래스는 스캔되지 않아 빈이 없다는 오류가 난다."],
          myth: [["@Component를 붙이면 어느 패키지에 있든 등록된다.", "스캔 기준 패키지 밖에 있으면 등록되지 않는다."]],
          answer: "컴포넌트 스캔은 기준 패키지와 하위 패키지에서 @Component가 붙은 클래스를 찾아 자동으로 빈으로 등록하는 기능입니다. 스프링 부트에서는 @SpringBootApplication이 있는 패키지가 기준이라 메인 클래스를 최상위 패키지에 둡니다. 직접 만든 비즈니스 클래스는 대부분 이 방식으로 등록합니다.",
          followUps: [
            [
              "다른 패키지의 클래스를 빈으로 쓰려면 어떻게 하나요?",
              "@ComponentScan의 basePackages에 그 패키지를 추가하거나, @Import로 설정 클래스를 직접 가져오거나, @Bean으로 수동 등록합니다."
            ]
          ],
          related: ["spring/seutereotaip-aeneoteisyeon", "spring/bean-sudong-deungrok"]
        },
        {
          id: "spring/seutereotaip-aeneoteisyeon",
          slug: "seutereotaip-aeneoteisyeon",
          title: "스테레오타입 애너테이션",
          deep: false,
          def: "`@Component`를 포함하면서 계층의 역할을 드러내는 `@Controller`, `@Service`, `@Repository`, `@Configuration` 애너테이션이다.",
          why: "클래스의 계층 역할을 드러내고, 예외 변환이나 요청 매핑처럼 역할별 부가 기능을 자동으로 적용받기 위해서다.",
          how: [
            "모두 내부에 `@Component`를 갖고 있어 컴포넌트 스캔 대상이 된다. 이름으로 역할을 표현하는 것이 주된 목적이다.",
            "- `@Controller`: 스프링 MVC 컨트롤러로 인식되어 요청 매핑 대상이 된다.",
            "- `@Service`: 비즈니스 로직 계층임을 표시한다. 특별한 부가 기능은 없다.",
            "- `@Repository`: 데이터 접근 계층. DB 기술별 예외를 스프링의 `DataAccessException`으로 바꿔 주는 예외 변환이 적용된다.",
            "- `@Configuration`: 설정 클래스. CGLIB 프록시가 적용되어 `@Bean` 싱글톤을 보장한다."
          ],
          use: ["JDBC 리포지토리에 `@Repository`를 붙여 `SQLException`이 `DataAccessException`으로 변환되게 한다."],
          myth: [["@Service를 붙이면 트랜잭션이 자동으로 적용된다.", "@Service에는 부가 기능이 없다. 트랜잭션은 @Transactional을 붙여야 한다."]],
          answer: "@Controller, @Service, @Repository, @Configuration은 모두 @Component를 포함해 스캔 대상이 되면서 계층의 역할을 드러냅니다. @Service는 표시용이지만 @Repository는 DB 예외를 스프링 예외로 바꿔 주고, @Configuration은 CGLIB 프록시가 적용됩니다. 그래서 역할에 맞는 애너테이션을 붙여야 합니다.",
          followUps: [
            [
              "@Service 대신 @Component를 붙여도 동작하나요?",
              "빈 등록은 똑같이 됩니다. 다만 계층의 역할이 코드에 드러나지 않고, AOP 포인트컷을 애너테이션 기준으로 걸 때 구분이 어려워집니다."
            ]
          ],
          related: ["spring/keomponeonteu-seukaen", "spring/configuration-peuroksi"]
        },
        {
          id: "spring/bean-sudong-deungrok",
          slug: "bean-sudong-deungrok",
          title: "@Bean 수동 등록",
          deep: false,
          def: "`@Configuration` 클래스 안의 메서드에 `@Bean`을 붙여, 그 메서드가 반환한 객체를 빈으로 등록하는 방식이다.",
          why: "소스를 고칠 수 없는 외부 라이브러리 객체를 빈으로 만들거나 생성 과정을 코드로 세밀하게 제어하기 위해서다.",
          how: [
            "빈 이름은 기본적으로 메서드 이름이며 `@Bean(name = \"...\")`으로 바꿀 수 있다. 다른 빈이 필요하면 메서드 파라미터로 받는다.",
            "- 외부 라이브러리 객체(ObjectMapper, RestClient, DataSource 등)는 클래스에 `@Component`를 붙일 수 없으므로 `@Bean`으로 등록한다.",
            "- 생성 과정에 설정이 많이 필요하거나 조건에 따라 다른 구현을 골라야 할 때 쓴다.",
            "- 설정이 한곳에 모여 어떤 기술 빈이 등록되는지 한눈에 보인다.",
            "같은 이름의 빈이 겹치면 스프링 부트는 기본적으로 오류를 낸다(`spring.main.allow-bean-definition-overriding=false`)."
          ],
          code: "@Configuration\npublic class ClientConfig {\n\n    @Bean\n    public RestClient paymentRestClient(RestClient.Builder builder) {\n        return builder.baseUrl(\"https://api.pay.example.com\").build();\n    }\n}",
          codeLang: "java",
          use: [
            "결제사 기본 URL과 타임아웃을 설정한 `RestClient`를 `@Bean`으로 등록한다.",
            "`ObjectMapper`에 날짜 형식을 지정해 `@Bean`으로 등록한다."
          ],
          answer: "@Bean은 @Configuration 클래스의 메서드가 반환한 객체를 빈으로 등록하는 방식입니다. 클래스에 @Component를 붙일 수 없는 외부 라이브러리 객체나 생성 과정에 설정이 많이 필요한 객체에 씁니다. 다른 빈이 필요하면 메서드 파라미터로 주입받습니다.",
          followUps: [
            [
              "같은 이름의 빈이 두 개 등록되면 어떻게 되나요?",
              "스프링 부트는 기본적으로 빈 정의 덮어쓰기를 막아 기동 시 오류가 납니다. 의도한 경우에만 spring.main.allow-bean-definition-overriding=true로 허용합니다."
            ]
          ],
          related: ["spring/keomponeonteu-seukaen", "spring/configuration-peuroksi"]
        }
      ]
    },
    {
      name: "빈 스코프",
      compare: {
        cols: ["기준", "싱글톤 스코프", "프로토타입 스코프", "request 스코프", "session 스코프"],
        rows: [
          ["인스턴스 수", "컨테이너당 1개", "요청할 때마다 새로", "HTTP 요청당 1개", "HTTP 세션당 1개"],
          ["소멸 콜백", "컨테이너 종료 시", "호출 안 됨", "요청 종료 시", "세션 종료 시"],
          ["싱글톤에 주입", "그대로 가능", "ObjectProvider 필요", "프록시나 Provider", "프록시나 Provider"],
          ["대표 쓰임", "대부분의 빈", "매번 새 상태 객체", "요청 추적 ID", "장바구니"]
        ]
      },
      concepts: [
        {
          id: "spring/singgeulton-seukopeu",
          slug: "singgeulton-seukopeu",
          title: "싱글톤 스코프",
          deep: false,
          def: "컨테이너에 빈 인스턴스를 하나만 만들어 모든 주입 지점에서 공유하는 기본 스코프다.",
          why: "요청마다 객체를 새로 만드는 생성 비용과 메모리 낭비를 막고, 상태 없는 서비스 객체를 공유하기 위해서다.",
          how: [
            "아무 설정이 없으면 모든 빈이 싱글톤이다. 컨테이너가 생성부터 소멸까지 전체 생명주기를 관리한다.",
            "- 장점: 요청마다 객체를 만들지 않아 메모리와 생성 비용을 아낀다.",
            "- 자바의 싱글톤 패턴(private 생성자, static 인스턴스)과 달리 일반 클래스로 만들고 컨테이너가 하나만 유지해 주므로 테스트와 확장이 쉽다(싱글톤 레지스트리).",
            "- 여러 스레드가 동시에 같은 인스턴스를 쓰므로 반드시 무상태로 설계해야 한다."
          ],
          use: ["서비스, 리포지토리, 컨트롤러 등 대부분의 빈이 싱글톤으로 동작한다."],
          myth: [["스프링 싱글톤은 JVM 전체에서 하나다.", "컨테이너당 하나다. ApplicationContext를 두 개 만들면 각각 따로 생긴다."]],
          answer: "싱글톤 스코프는 컨테이너에 빈을 하나만 만들어 모든 곳에서 공유하는 기본 스코프입니다. 자바 싱글톤 패턴처럼 private 생성자를 쓰지 않아도 컨테이너가 하나만 유지해 주므로 테스트와 확장이 쉽습니다. 대신 여러 스레드가 공유하므로 무상태로 설계해야 합니다.",
          analogy: "회사 공용 프린터 한 대를 모든 직원이 같이 쓰는 것과 같습니다. 프린터에 개인 서류를 놔두면 남이 가져갑니다.",
          followUps: [
            [
              "자바 싱글톤 패턴의 단점은 무엇이고 스프링은 어떻게 해결했나요?",
              "싱글톤 패턴은 private 생성자와 static 필드 때문에 상속과 목 교체가 어렵고 구현 클래스에 직접 의존하게 됩니다. 스프링은 일반 클래스를 컨테이너가 하나만 관리하는 싱글톤 레지스트리로 이 문제를 없앴습니다."
            ]
          ],
          related: ["spring/singgeultongwa-musangtae", "spring/peurototaip-seukopeu"]
        },
        {
          id: "spring/peurototaip-seukopeu",
          slug: "peurototaip-seukopeu",
          title: "프로토타입 스코프",
          deep: false,
          def: "빈을 요청할 때마다 새 인스턴스를 만들어 주는 스코프로, `@Scope(\"prototype\")`으로 지정한다.",
          why: "상태를 가지는 객체처럼 사용할 때마다 새 인스턴스가 필요한 경우를 컨테이너로 처리하기 위해서다.",
          how: [
            "컨테이너는 생성, 의존성 주입, 초기화 콜백까지만 하고 이후에는 관리하지 않는다. 그래서 `@PreDestroy`가 호출되지 않으며 정리는 사용하는 쪽이 책임진다.",
            "- 싱글톤에 주입하면 주입 시점에 한 번만 만들어져 계속 같은 객체가 쓰인다. 프로토타입의 의미가 사라진다.",
            "- 매번 새 객체가 필요하면 `ObjectProvider<T>`를 주입받아 `getObject()`로 그때그때 꺼낸다.",
            "실무에서 쓰이는 경우는 드물고, 상태를 가진 객체가 매번 새로 필요할 때 정도로 한정된다."
          ],
          use: ["요청마다 새 상태를 가져야 하는 리포트 빌더를 프로토타입 빈으로 두고 `ObjectProvider`로 꺼낸다."],
          warn: ["리소스를 잡는 프로토타입 빈은 소멸 콜백이 없으므로 직접 닫아야 한다."],
          myth: [["싱글톤 빈에 주입된 프로토타입 빈은 호출할 때마다 새로 만들어진다.", "주입 시점에 한 번만 만들어져 계속 같은 객체가 쓰인다."]],
          answer: "프로토타입 스코프는 빈을 요청할 때마다 새 인스턴스를 만들어 줍니다. 컨테이너는 생성과 주입, 초기화까지만 하고 이후 관리는 하지 않아 @PreDestroy가 호출되지 않습니다. 싱글톤에 주입하면 한 번만 만들어지므로 매번 새로 받으려면 ObjectProvider를 씁니다.",
          analogy: "주문할 때마다 새로 만들어 건네주는 일회용 컵입니다. 다 쓴 컵을 치우는 것은 손님 몫입니다.",
          followUps: [
            [
              "싱글톤 빈에서 프로토타입 빈을 매번 새로 쓰려면 어떻게 하나요?",
              "ObjectProvider나 jakarta.inject.Provider를 주입받아 필요할 때마다 getObject()로 꺼내면 됩니다. 스코프 프록시(proxyMode)를 쓰는 방법도 있습니다."
            ]
          ],
          related: ["spring/objectprovider", "spring/singgeulton-seukopeu"]
        },
        {
          id: "spring/request-seukopeu",
          slug: "request-seukopeu",
          title: "request 스코프",
          deep: false,
          def: "HTTP 요청 하나가 들어와서 나갈 때까지 유지되고, 요청마다 별도 인스턴스가 만들어지는 웹 스코프다.",
          why: "추적 ID처럼 HTTP 요청마다 따로 유지해야 하는 데이터를 파라미터로 넘기지 않고 안전하게 보관하기 위해서다.",
          how: [
            "`@RequestScope` 또는 `@Scope(\"request\")`로 지정한다. 요청이 끝나면 소멸 콜백이 호출된다.",
            "- 쓰임: 요청별 추적 ID(UUID)를 저장해 로그에 남기기, 요청 단위로 모으는 정보 보관.",
            "- 기동 시점에는 요청이 없어 싱글톤에 바로 주입하면 오류가 난다. `ObjectProvider`로 꺼내거나 `proxyMode = ScopedProxyMode.TARGET_CLASS`로 가짜 프록시를 주입한다.",
            "- 프록시를 쓰면 메서드를 호출할 때마다 현재 요청의 진짜 빈을 찾아 위임한다."
          ],
          flow: ["싱글톤에 프록시 주입", "요청 도착", "프록시 메서드 호출", "현재 요청의 빈 조회·생성", "실제 빈에 위임", "요청 종료 시 소멸"],
          code: "@Component\n@Scope(value = \"request\", proxyMode = ScopedProxyMode.TARGET_CLASS)\npublic class RequestTrace {\n    private final String traceId = UUID.randomUUID().toString();\n    public String traceId() { return traceId; }\n}",
          codeLang: "java",
          use: ["요청마다 UUID를 만들어 모든 로그에 붙여, 한 요청의 로그를 묶어 추적한다."],
          answer: "request 스코프는 HTTP 요청 하나 동안 유지되고 요청마다 별도 인스턴스가 만들어지는 웹 스코프입니다. 기동 시점에는 요청이 없으므로 싱글톤에 주입하려면 스코프 프록시나 ObjectProvider가 필요합니다. 요청별 추적 ID처럼 요청 단위로 묶을 정보를 보관할 때 씁니다.",
          followUps: [
            [
              "스코프 프록시는 어떻게 요청마다 다른 빈을 쓰나요?",
              "싱글톤에는 CGLIB 가짜 프록시가 주입되고, 메서드가 호출될 때마다 프록시가 현재 요청에 해당하는 진짜 빈을 찾아 위임합니다. 그래서 같은 필드를 써도 요청마다 다른 객체가 동작합니다."
            ]
          ],
          related: ["spring/session-seukopeu", "spring/objectprovider"]
        },
        {
          id: "spring/session-seukopeu",
          slug: "session-seukopeu",
          title: "session 스코프",
          deep: false,
          def: "HTTP 세션이 살아 있는 동안 유지되고, 세션마다 별도 인스턴스가 만들어지는 웹 스코프다.",
          why: "장바구니처럼 사용자별로 여러 요청에 걸쳐 유지해야 하는 상태를 빈으로 관리하기 위해서다.",
          how: [
            "`@SessionScope`로 지정한다. 세션이 만료되거나 무효화되면 빈도 소멸한다.",
            "- 쓰임: 로그인 사용자의 장바구니, 다단계 폼의 중간 상태처럼 사용자별로 유지할 데이터.",
            "- request 스코프와 마찬가지로 싱글톤에 주입할 때는 스코프 프록시나 `ObjectProvider`가 필요하다.",
            "- 세션에 저장되므로 서버를 여러 대로 늘리면 세션 공유(Spring Session + Redis)가 필요하고, 직렬화 가능해야 한다."
          ],
          use: ["비로그인 사용자의 장바구니를 `@SessionScope` 빈에 담아 페이지 이동 중에도 유지한다."],
          warn: ["세션 스코프 빈에 큰 데이터를 담으면 사용자 수만큼 메모리를 차지한다."],
          answer: "session 스코프는 HTTP 세션이 살아 있는 동안 유지되고 세션마다 인스턴스가 만들어지는 웹 스코프입니다. 장바구니처럼 사용자별로 유지할 데이터에 씁니다. 서버를 여러 대로 늘리면 세션 공유가 필요하고, 사용자 수만큼 메모리를 쓴다는 점을 주의해야 합니다.",
          followUps: [
            [
              "서버를 두 대로 늘리면 session 스코프 빈은 어떻게 되나요?",
              "세션이 서버 메모리에 있으면 다른 서버로 요청이 갔을 때 데이터가 없습니다. Spring Session과 Redis로 세션을 공유하고, 빈을 직렬화 가능하게 만들어야 합니다."
            ]
          ],
          related: ["spring/request-seukopeu"]
        },
        {
          id: "spring/objectprovider",
          slug: "objectprovider",
          title: "ObjectProvider",
          deep: false,
          def: "빈을 주입 시점이 아니라 필요한 시점에 컨테이너에서 꺼내 쓰게 해 주는 조회 도구다.",
          why: "싱글톤에 짧은 스코프 빈을 주입하면 한 번 받은 객체가 고정되므로, 필요한 시점마다 컨테이너에서 새로 꺼내기 위해서다.",
          how: [
            "`ObjectProvider<T>`를 주입받고 `getObject()`를 호출하면 그때 컨테이너에서 빈을 찾아 준다(Dependency Lookup).",
            "- 프로토타입 빈을 매번 새로 받을 때 쓴다.",
            "- request·session 스코프 빈처럼 기동 시점에 아직 없는 빈을 나중에 꺼낼 때 쓴다.",
            "- `getIfAvailable()`, `getIfUnique()`로 빈이 없거나 여러 개인 경우를 안전하게 처리한다.",
            "자바 표준인 `jakarta.inject.Provider`도 같은 역할을 한다."
          ],
          code: "@Service\n@RequiredArgsConstructor\npublic class ReportService {\n    private final ObjectProvider<ReportBuilder> builderProvider; // prototype 빈\n\n    public Report create() {\n        ReportBuilder builder = builderProvider.getObject(); // 호출할 때마다 새 객체\n        return builder.build();\n    }\n}",
          codeLang: "java",
          use: ["선택적으로 등록되는 빈을 `getIfAvailable()`로 받아, 없으면 기본 동작으로 처리한다.", "프로토타입 빈을 `getObject()`로 호출마다 새로 꺼낸다."],
          answer: "ObjectProvider는 빈을 주입 시점이 아니라 필요한 시점에 컨테이너에서 꺼내 쓰게 해 줍니다. 프로토타입 빈을 매번 새로 받거나, 기동 시점에 없는 웹 스코프 빈을 나중에 꺼낼 때 씁니다. getIfAvailable 같은 메서드로 빈이 없는 경우도 안전하게 처리합니다.",
          followUps: [
            [
              "ObjectProvider와 ApplicationContext.getBean()의 차이는?",
              "둘 다 필요할 때 빈을 꺼내지만, getBean은 컨테이너 전체에 의존하게 되고 ObjectProvider는 필요한 타입 하나만 조회하는 범위로 좁힙니다. 테스트에서 바꾸기도 쉬워 ObjectProvider를 권장합니다."
            ]
          ],
          related: ["spring/peurototaip-seukopeu", "spring/request-seukopeu"]
        }
      ]
    },
    {
      name: "싱글톤과 무상태",
      concepts: [
        {
          id: "spring/singgeultongwa-musangtae",
          slug: "singgeultongwa-musangtae",
          title: "싱글톤과 무상태",
          deep: true,
          def: "싱글톤 빈은 여러 요청 스레드가 동시에 공유하므로, 요청마다 달라지는 값을 인스턴스 필드에 저장하지 않는 무상태로 설계해야 한다.",
          why: "톰캣은 요청마다 다른 스레드로 같은 빈 인스턴스의 메서드를 동시에 실행한다. 필드에 상태를 두면 한 사용자의 값이 다른 사용자의 값으로 덮어써지는 동시성 버그가 생긴다.",
          how: [
            "1) 사용자 A의 요청 스레드가 `this.price = 10000`을 저장한다.",
            "2) 거의 동시에 사용자 B의 요청 스레드가 같은 인스턴스에 `this.price = 20000`을 저장한다.",
            "3) A의 스레드가 `this.price`를 읽으면 20000이 나온다. A가 B의 금액으로 결제하게 된다.",
            "이런 버그는 로컬에서 혼자 테스트할 때는 재현되지 않고 트래픽이 몰릴 때만 간헐적으로 나타나 찾기 매우 어렵다.",
            "- 필드에는 다른 빈(의존성)이나 변하지 않는 설정값만 둔다. `final`로 선언하면 실수를 막기 쉽다.",
            "- 요청별 값은 지역 변수, 파라미터, 반환값으로 주고받는다. 지역 변수는 스레드마다 별도의 스택에 있어 안전하다.",
            "- 공유 상태가 꼭 필요하면 `ConcurrentHashMap`, `AtomicLong` 같은 스레드 안전한 자료구조를 쓴다."
          ],
          flow: ["A 스레드가 필드에 값 저장", "B 스레드가 같은 필드 덮어씀", "A 스레드가 필드 읽음", "A가 B의 값을 사용"],
          code: "@Service\npublic class PriceService {\n    // 잘못된 예: 요청마다 바뀌는 값을 필드에 저장\n    private int price;\n    public void order(int amount) { this.price = amount; /* ... */ }\n\n    // 올바른 예: 지역 변수와 반환값으로만 다룬다\n    public int calculate(int amount, int discount) {\n        int price = amount - discount;\n        return price;\n    }\n}",
          codeLang: "java",
          use: [
            "코드 리뷰에서 서비스 클래스의 `final`이 아닌 필드를 먼저 확인해 상태 보관 여부를 점검한다.",
            "공유 카운터가 필요하면 `AtomicLong`이나 `ConcurrentHashMap`을 쓴다."
          ],
          warn: [
            "`SimpleDateFormat`처럼 스레드 안전하지 않은 객체를 필드로 공유하지 않는다. `DateTimeFormatter`는 불변이라 안전하다.",
            "컨트롤러도 싱글톤이므로 같은 규칙이 적용된다.",
            "ThreadLocal로 요청별 값을 보관했다면 요청이 끝날 때 반드시 `remove()`한다."
          ],
          myth: [
            ["싱글톤이면 한 번에 한 요청만 처리하므로 안전하다.", "인스턴스는 하나지만 여러 스레드가 동시에 메서드를 실행한다."],
            ["지역 변수도 공유되니 위험하다.", "지역 변수는 스레드마다 별도의 스택에 있어 공유되지 않는다."]
          ],
          answer: "스프링 빈은 기본이 싱글톤이고 여러 요청 스레드가 같은 인스턴스를 동시에 실행합니다. 그래서 인스턴스 필드에 요청마다 바뀌는 값을 저장하면 다른 사용자의 값으로 덮어써집니다. 필드에는 의존성과 불변 값만 두고 요청별 데이터는 지역 변수나 파라미터로 다뤄 무상태로 설계합니다.",
          analogy: "은행 창구 한 곳을 여러 손님이 동시에 쓰는데, 창구 책상 위에 금액 메모를 놓아두면 다음 손님이 그 메모를 자기 것으로 착각하는 상황입니다.",
          qa: [
            "싱글톤 빈이 스레드 안전하지 않은 경우는 언제인가요?",
            "싱글톤 빈 자체는 하나지만 여러 요청 스레드가 동시에 같은 인스턴스를 실행합니다. 그래서 인스턴스 필드에 요청마다 바뀌는 값을 저장하면 다른 스레드가 덮어써 데이터가 섞입니다. 필드에는 의존성과 불변 값만 두고, 요청별 데이터는 지역 변수나 파라미터로 다뤄 무상태로 설계해야 합니다."
          ],
          followUps: [
            [
              "요청별 사용자 정보를 여러 계층에서 써야 하면 어떻게 하나요?",
              "파라미터로 넘기는 것이 가장 명확하고, 꼭 필요하면 ThreadLocal이나 request 스코프 빈을 씁니다. ThreadLocal은 스레드 풀에서 재사용되므로 요청이 끝날 때 반드시 remove해야 합니다."
            ],
            [
              "synchronized를 붙이면 상태를 가져도 괜찮지 않나요?",
              "안전해지지만 모든 요청이 그 메서드에서 줄을 서게 되어 처리량이 크게 떨어집니다. 서버가 여러 대면 효과도 없으므로 무상태 설계가 우선입니다."
            ],
            [
              "SimpleDateFormat을 필드로 공유하면 안 되는 이유는?",
              "SimpleDateFormat은 내부에 상태를 갖고 있어 스레드 안전하지 않아 동시에 쓰면 날짜가 잘못 파싱됩니다. 불변인 DateTimeFormatter를 쓰면 안전하게 공유할 수 있습니다."
            ]
          ],
          related: ["spring/singgeulton-seukopeu"]
        }
      ]
    },
    {
      name: "빈 생명주기",
      compare: {
        cols: ["개념", "호출 시점", "지정 방식", "주로 쓰는 곳"],
        rows: [
          ["빈 생명주기", "컨테이너 시작~종료 전체", "컨테이너가 자동 관리", "초기화·정리 시점 이해"],
          ["@PostConstruct", "의존관계 주입 직후", "메서드에 애너테이션", "캐시 예열, 설정 검증"],
          ["@PreDestroy", "컨테이너 종료, 소멸 직전", "메서드에 애너테이션", "커넥션·스레드 풀 정리"],
          ["initMethod/destroyMethod", "주입 직후 / 소멸 직전", "`@Bean` 속성에 이름 지정", "코드 수정 불가한 외부 라이브러리"]
        ]
      },
      concepts: [
        {
          id: "spring/bin-saengmyeongjugi",
          slug: "bin-saengmyeongjugi",
          title: "빈 생명주기",
          deep: true,
          def: "싱글톤 빈은 컨테이너 생성 → 빈 생성 → 의존관계 주입 → 초기화 콜백 → 사용 → 소멸 전 콜백 → 컨테이너 종료 순서로 관리된다.",
          why: "객체 생성과 초기화를 분리해야 의존성이 모두 준비된 뒤에 안전하게 초기화할 수 있고, 종료 시 연결과 스레드 같은 자원을 확실히 정리할 수 있기 때문이다.",
          how: [
            "1) 스프링 컨테이너 생성: 설정 정보를 읽어 빈 정의를 등록한다.",
            "2) 빈 생성: 생성자를 호출해 객체를 만든다. 생성자 주입이면 이때 의존성도 함께 들어온다.",
            "3) 의존관계 주입: 세터·필드 주입 대상에 빈을 넣는다.",
            "4) BeanPostProcessor 초기화 전 처리.",
            "5) 초기화 콜백: `@PostConstruct` → `InitializingBean.afterPropertiesSet()` → `@Bean(initMethod)` 순서로 호출된다.",
            "6) BeanPostProcessor 초기화 후 처리: AOP 프록시가 여기서 만들어져 원본 대신 등록된다.",
            "7) 사용.",
            "8) 컨테이너 종료 시 소멸 전 콜백: `@PreDestroy` → `DisposableBean.destroy()` → `destroyMethod` 순서.",
            "세터·필드 주입이면 생성자 안에서는 의존성이 아직 없다. 그래서 외부 연결, 캐시 미리 채우기 같은 초기화는 생성자가 아니라 초기화 콜백에서 한다."
          ],
          flow: [
            "컨테이너 생성",
            "빈 객체 생성",
            "의존관계 주입",
            "BeanPostProcessor 전처리",
            "초기화 콜백",
            "BeanPostProcessor 후처리",
            "사용 후 소멸 콜백"
          ],
          code: "@Component\npublic class ExchangeRateCache {\n    private final ExchangeRateClient client;\n    private final Map<String, BigDecimal> rates = new ConcurrentHashMap<>();\n\n    public ExchangeRateCache(ExchangeRateClient client) { this.client = client; } // 생성만\n\n    @PostConstruct\n    void load() { rates.putAll(client.fetchAll()); } // 의존성 준비 후 초기화\n\n    @PreDestroy\n    void clear() { rates.clear(); } // 종료 전 정리\n}",
          codeLang: "java",
          use: ["기동 시 환율 정보를 `@PostConstruct`에서 미리 불러와 캐시에 넣는다.", "종료 시 `@PreDestroy`에서 외부 메시지 큐 연결을 닫는다."],
          warn: [
            "`@PostConstruct` 시점에는 아직 AOP 프록시가 적용되기 전이라 `@Transactional`이 동작하지 않는다. 트랜잭션이 필요한 초기화는 `ApplicationReadyEvent` 리스너에서 한다.",
            "프로토타입 빈은 소멸 콜백이 호출되지 않는다.",
            "`kill -9`처럼 강제 종료하면 소멸 콜백이 실행되지 않는다. 부트는 `server.shutdown=graceful`로 우아한 종료를 지원한다."
          ],
          myth: [["@PostConstruct 안에서 @Transactional 메서드를 부르면 트랜잭션이 걸린다.", "이 시점에는 프록시가 적용되기 전이라 트랜잭션이 걸리지 않는다."]],
          answer: "싱글톤 빈은 컨테이너 생성, 빈 생성, 의존관계 주입, 초기화 콜백, 사용, 소멸 전 콜백, 컨테이너 종료 순서로 관리됩니다. 생성과 초기화를 나눠 의존성이 모두 준비된 뒤 초기화하고, 종료 시 자원을 정리합니다. 콜백은 주로 @PostConstruct와 @PreDestroy를 씁니다.",
          analogy: "집을 짓고(생성), 전기와 수도를 연결하고(주입), 입주 청소를 한 뒤(초기화) 살다가, 이사 갈 때 짐을 빼고 정리하는(소멸) 순서입니다.",
          qa: [
            "스프링 빈의 생명주기와 초기화 콜백 방법을 설명해 주세요.",
            "컨테이너가 빈을 생성하고 의존관계를 주입한 뒤 초기화 콜백을 호출하고, 사용 후 컨테이너 종료 시 소멸 콜백을 호출합니다. 초기화와 소멸은 자바 표준인 @PostConstruct와 @PreDestroy를 주로 쓰고, 코드를 고칠 수 없는 외부 라이브러리는 @Bean의 initMethod와 destroyMethod를 씁니다. 생성자에서는 의존성이 다 준비되지 않았을 수 있어 무거운 초기화는 콜백에서 합니다."
          ],
          followUps: [
            [
              "초기화에 트랜잭션이 필요하면 어디서 해야 하나요?",
              "ApplicationReadyEvent 리스너나 ApplicationRunner에서 다른 빈의 @Transactional 메서드를 호출합니다. 이때는 모든 프록시가 준비된 상태입니다."
            ],
            [
              "생성자에서 초기화하면 안 되는 이유는 무엇인가요?",
              "세터·필드 주입이면 생성자 시점에 의존성이 아직 없습니다. 또 생성자는 객체를 만드는 책임만 갖고 외부 연결 같은 무거운 작업은 분리하는 편이 유지보수에 좋습니다."
            ],
            [
              "애플리케이션을 종료할 때 진행 중인 요청은 어떻게 되나요?",
              "server.shutdown=graceful을 설정하면 새 요청을 받지 않고 진행 중인 요청이 끝날 때까지 기다린 뒤 종료합니다. 강제 종료(kill -9)는 소멸 콜백조차 실행되지 않습니다."
            ]
          ],
          related: [
            "spring/postconstruct",
            "spring/predestroy",
            "spring/initmethod-destroymethod",
            "spring/beanpostprocessor"
          ]
        },
        {
          id: "spring/postconstruct",
          slug: "postconstruct",
          title: "@PostConstruct",
          deep: false,
          def: "의존관계 주입이 끝난 직후 한 번 호출할 초기화 메서드를 지정하는 자바 표준(jakarta.annotation) 애너테이션이다.",
          why: "생성자 시점에는 의존성이 아직 다 주입되지 않았을 수 있으므로, 주입이 끝난 뒤 안전하게 초기화 작업을 하기 위해서다.",
          how: [
            "메서드에 붙이기만 하면 되어 가장 간단하고, 스프링에 종속되지 않아 권장되는 방법이다.",
            "- 쓰임: 캐시 미리 채우기, 설정값 검증, 외부 연결 준비.",
            "- 스프링 부트 3부터 패키지가 `javax.annotation`에서 `jakarta.annotation`으로 바뀌었다.",
            "- 실제 호출은 CommonAnnotationBeanPostProcessor가 담당한다."
          ],
          use: ["설정값이 올바른지 기동 시점에 검증하고, 잘못되면 예외를 던져 애플리케이션이 뜨지 않게 한다."],
          warn: ["이 시점에는 프록시가 적용되기 전이라 `@Transactional`, `@Async`가 동작하지 않는다."],
          myth: [["@PostConstruct는 스프링 애너테이션이다.", "자바 표준(jakarta.annotation) 애너테이션이며, 스프링은 이를 처리해 줄 뿐이다."]],
          answer: "@PostConstruct는 의존관계 주입이 끝난 직후 한 번 호출할 초기화 메서드를 지정하는 자바 표준 애너테이션입니다. 스프링에 종속되지 않고 사용이 간단해 가장 권장됩니다. 다만 이 시점에는 프록시가 적용되기 전이라 @Transactional이 동작하지 않습니다.",
          followUps: [
            [
              "부트 3로 올렸더니 @PostConstruct import가 깨졌습니다. 왜 그런가요?",
              "부트 3는 Jakarta EE 기반이라 패키지가 javax.annotation에서 jakarta.annotation으로 바뀌었습니다. import를 바꾸면 됩니다."
            ]
          ],
          related: ["spring/bin-saengmyeongjugi", "spring/predestroy"]
        },
        {
          id: "spring/predestroy",
          slug: "predestroy",
          title: "@PreDestroy",
          deep: false,
          def: "컨테이너가 종료되면서 빈이 소멸되기 직전에 호출할 정리 메서드를 지정하는 자바 표준 애너테이션이다.",
          why: "애플리케이션 종료 시 커넥션, 스레드 풀 같은 자원을 정리하지 않으면 누수나 작업 유실이 생기는 것을 막기 위해서다.",
          how: [
            "연결 닫기, 스레드 풀 종료, 임시 파일 삭제처럼 자원을 정리하는 데 쓴다.",
            "- 싱글톤 빈은 컨테이너 종료 시 호출된다. 웹 스코프 빈은 요청·세션이 끝날 때 호출된다.",
            "- 프로토타입 빈은 컨테이너가 소멸을 관리하지 않아 호출되지 않는다.",
            "- 정상 종료(SIGTERM)에서만 실행되고 강제 종료(SIGKILL)에서는 실행되지 않는다."
          ],
          use: ["직접 만든 `ExecutorService`를 `@PreDestroy`에서 `shutdown()`해 스레드를 정리한다."],
          answer: "@PreDestroy는 컨테이너가 종료되면서 빈이 소멸되기 직전에 호출할 정리 메서드를 지정합니다. 연결 닫기, 스레드 풀 종료 같은 자원 정리에 씁니다. 프로토타입 빈과 강제 종료 상황에서는 호출되지 않는다는 점을 주의해야 합니다.",
          followUps: [
            [
              "쿠버네티스에서 파드가 내려갈 때 @PreDestroy가 실행되나요?",
              "쿠버네티스는 먼저 SIGTERM을 보내므로 정상 종료 흐름을 타 실행됩니다. 다만 유예 시간 안에 끝나지 않으면 SIGKILL로 강제 종료되어 실행이 끊길 수 있습니다."
            ]
          ],
          related: ["spring/bin-saengmyeongjugi", "spring/postconstruct", "spring/peurototaip-seukopeu"]
        },
        {
          id: "spring/initmethod-destroymethod",
          slug: "initmethod-destroymethod",
          title: "initMethod/destroyMethod",
          deep: false,
          def: "`@Bean(initMethod = \"init\", destroyMethod = \"close\")`처럼 등록 시점에 초기화·소멸 메서드 이름을 지정하는 방식이다.",
          why: "소스를 고칠 수 없어 애너테이션을 붙일 수 없는 외부 라이브러리 객체에도 초기화와 정리 메서드를 연결하기 위해서다.",
          how: [
            "빈 클래스 코드를 고칠 수 없는 외부 라이브러리 객체에 초기화·소멸 메서드를 연결할 때 쓴다.",
            "- 메서드 이름만 지정하므로 클래스가 스프링 인터페이스에 의존하지 않는다.",
            "- `destroyMethod`의 기본값은 추론(inferred)이라 `close`나 `shutdown`이라는 public 메서드가 있으면 자동으로 호출된다. 원치 않으면 `destroyMethod = \"\"`로 끈다.",
            "`InitializingBean`/`DisposableBean` 인터페이스 방식은 코드가 스프링에 묶여 요즘은 거의 쓰지 않는다."
          ],
          code: "@Bean(initMethod = \"connect\", destroyMethod = \"disconnect\")\npublic LegacyMqClient mqClient() {\n    return new LegacyMqClient(\"mq.internal:5672\");\n}",
          codeLang: "java",
          use: ["사내 레거시 MQ 클라이언트의 `connect`, `disconnect` 메서드를 `@Bean` 속성으로 연결한다."],
          myth: [
            [
              "destroyMethod를 지정하지 않으면 정리 메서드가 호출되지 않는다.",
              "기본값이 추론 모드라 public close나 shutdown 메서드가 있으면 자동으로 호출된다."
            ]
          ],
          answer: "@Bean의 initMethod와 destroyMethod 속성으로 초기화·소멸 메서드 이름을 지정하는 방식입니다. 코드를 고칠 수 없는 외부 라이브러리 객체에 쓰고, 클래스가 스프링에 의존하지 않습니다. destroyMethod는 기본적으로 close나 shutdown 메서드를 자동으로 찾아 호출합니다.",
          followUps: [
            [
              "DataSource 빈은 종료할 때 어떻게 정리되나요?",
              "HikariDataSource는 close 메서드가 있어 destroyMethod 추론으로 컨테이너 종료 시 자동으로 커넥션 풀이 닫힙니다. 따로 설정할 필요가 없습니다."
            ]
          ],
          related: ["spring/bin-saengmyeongjugi", "spring/bean-sudong-deungrok"]
        }
      ]
    },
    {
      name: "설정 클래스 프록시",
      compare: {
        cols: ["기준", "@Configuration 프록시", "proxyBeanMethods"],
        rows: [
          ["설정", "@Configuration (기본)", "proxyBeanMethods = false"],
          ["CGLIB 프록시", "생성됨", "생성 안 됨"],
          ["@Bean 메서드 직접 호출", "같은 싱글톤 반환", "매번 새 객체"],
          ["다른 빈 참조 방법", "메서드 호출 가능", "메서드 파라미터로 주입"]
        ]
      },
      concepts: [
        {
          id: "spring/configuration-peuroksi",
          slug: "configuration-peuroksi",
          title: "@Configuration 프록시",
          deep: false,
          def: "스프링이 `@Configuration` 클래스를 CGLIB으로 상속한 프록시로 바꿔 등록해, `@Bean` 메서드를 여러 번 호출해도 같은 싱글톤을 돌려주는 기능이다.",
          why: "`@Bean` 메서드끼리 호출할 때 객체가 여러 번 만들어져 싱글톤이 깨지는 것을 막기 위해서다.",
          how: [
            "`@Bean` 메서드 안에서 다른 `@Bean` 메서드를 호출하면 자바 코드상으로는 객체가 매번 새로 생길 것처럼 보인다.",
            "실제로는 등록된 빈이 `AppConfig$$SpringCGLIB$$0` 같은 프록시이고, 프록시가 `@Bean` 메서드 호출을 가로채 컨테이너에 그 빈이 이미 있으면 기존 빈을 돌려준다.",
            "- 그래서 `memberRepository()`를 두 서비스 빈 메서드에서 호출해도 리포지토리는 하나만 생긴다.",
            "- `@Component` 클래스 안의 `@Bean`(lite 모드)은 프록시가 없어 메서드를 직접 호출하면 새 객체가 생긴다."
          ],
          flow: ["설정 클래스 CGLIB 상속", "프록시를 빈으로 등록", "@Bean 메서드 호출 가로챔", "컨테이너에 빈이 있는지 확인", "있으면 기존 빈 반환"],
          code: "@Configuration\npublic class AppConfig {\n    @Bean public MemberRepository memberRepository() { return new MemoryMemberRepository(); }\n    @Bean public MemberService memberService() { return new MemberService(memberRepository()); }\n    @Bean public OrderService orderService() { return new OrderService(memberRepository()); }\n    // memberRepository()가 두 번 호출되지만 같은 인스턴스가 주입된다\n}",
          codeLang: "java",
          use: ["설정 클래스의 `getClass()`를 찍어 `$$SpringCGLIB$$`가 붙은 것을 확인하며 동작 원리를 검증한다."],
          answer: "@Configuration 클래스는 CGLIB으로 상속한 프록시로 등록되어, @Bean 메서드를 여러 번 호출해도 같은 싱글톤을 돌려줍니다. 프록시가 메서드 호출을 가로채 컨테이너에 이미 그 빈이 있으면 기존 빈을 반환하기 때문입니다. @Component 안의 @Bean에는 이 보장이 없습니다.",
          followUps: [
            [
              "@Configuration 클래스를 final로 만들면 어떻게 되나요?",
              "CGLIB은 상속으로 프록시를 만들기 때문에 final 클래스는 프록시를 만들 수 없어 기동 시 오류가 납니다. proxyBeanMethods = false로 두면 final이어도 됩니다."
            ]
          ],
          related: ["spring/proxybeanmethods", "spring/bean-sudong-deungrok"]
        },
        {
          id: "spring/proxybeanmethods",
          slug: "proxybeanmethods",
          title: "proxyBeanMethods",
          deep: false,
          def: "`@Configuration(proxyBeanMethods = false)`로 설정 클래스의 CGLIB 프록시 생성을 끄는 옵션이다.",
          why: "`@Bean` 메서드 간 호출이 없는 설정에서 불필요한 CGLIB 프록시 비용을 줄여 기동 속도와 네이티브 이미지 호환성을 높이기 위해서다.",
          how: [
            "프록시를 만들지 않으므로 기동 속도와 메모리에서 조금 이득이 있고, GraalVM 네이티브 이미지에도 유리하다.",
            "- 대신 `@Bean` 메서드를 직접 호출하면 매번 새 객체가 생긴다. 다른 빈이 필요하면 메서드 호출 대신 메서드 파라미터로 주입받아야 한다.",
            "- 스프링 부트의 자동 설정 클래스들은 모두 `proxyBeanMethods = false`를 쓰고 파라미터 주입 방식을 따른다."
          ],
          code: "@Configuration(proxyBeanMethods = false)\npublic class AppConfig {\n    @Bean public MemberRepository memberRepository() { return new MemoryMemberRepository(); }\n    @Bean public MemberService memberService(MemberRepository repo) { return new MemberService(repo); }\n}",
          codeLang: "java",
          use: ["빈끼리 메서드 호출이 없는 단순 설정 클래스에 `proxyBeanMethods = false`를 붙여 프록시를 생략한다."],
          answer: "proxyBeanMethods = false는 설정 클래스의 CGLIB 프록시 생성을 끄는 옵션입니다. 기동 속도와 네이티브 이미지에 유리하지만, @Bean 메서드를 직접 호출하면 매번 새 객체가 생깁니다. 그래서 다른 빈은 메서드 파라미터로 주입받아야 하고, 부트 자동 설정이 모두 이 방식을 따릅니다.",
          followUps: [
            [
              "proxyBeanMethods = false인데 @Bean 메서드를 서로 호출하면 무슨 문제가 생기나요?",
              "호출할 때마다 새 객체가 생겨 같은 타입 객체가 여러 개 존재하게 됩니다. 컨테이너에 등록된 빈과 주입된 객체가 달라 상태 불일치나 커넥션 중복 생성 같은 문제가 생길 수 있습니다."
            ]
          ],
          related: ["spring/configuration-peuroksi"]
        }
      ]
    },
    {
      name: "컨테이너 확장 지점",
      compare: {
        cols: ["기준", "BeanPostProcessor", "BeanFactoryPostProcessor"],
        rows: [
          ["다루는 대상", "만들어진 빈 객체", "빈 정의(설계도)"],
          ["실행 시점", "빈 초기화 전후", "모든 빈 생성 전"],
          ["대표 구현", "AOP 자동 프록시 생성기", "플레이스홀더 치환기"],
          ["할 수 있는 일", "빈 가공, 프록시로 교체", "빈 정의 수정·추가"]
        ]
      },
      concepts: [
        {
          id: "spring/beanpostprocessor",
          slug: "beanpostprocessor",
          title: "BeanPostProcessor",
          deep: false,
          def: "빈이 생성되고 의존성이 주입된 뒤 초기화 전후에 끼어들어 빈을 조작하거나 다른 객체로 바꿔 반환할 수 있는 확장 지점이다.",
          why: "모든 빈의 생성 과정에 공통으로 끼어들어 `@Autowired` 처리나 AOP 프록시 교체 같은 기능을 구현하기 위해서다.",
          how: [
            "`postProcessBeforeInitialization`은 초기화 콜백 전에, `postProcessAfterInitialization`은 초기화 콜백 후에 모든 빈에 대해 호출된다. 반환한 객체가 원본 대신 컨테이너에 등록된다.",
            "- `@Autowired` 처리: AutowiredAnnotationBeanPostProcessor",
            "- `@PostConstruct`, `@PreDestroy` 처리: CommonAnnotationBeanPostProcessor",
            "- AOP 프록시 생성: AnnotationAwareAspectJAutoProxyCreator가 초기화 후 단계에서 원본 대신 프록시를 등록한다.",
            "그래서 `@Transactional`이 붙은 빈을 주입받으면 실제로는 원본이 아니라 프록시 객체를 받는다."
          ],
          flow: ["빈 생성과 주입 완료", "Before 처리 호출", "초기화 콜백 실행", "After 처리 호출", "반환 객체를 컨테이너에 등록"],
          use: ["특정 애너테이션이 붙은 빈을 찾아 실행 시간 측정 프록시로 감싸는 커스텀 BeanPostProcessor를 만든다."],
          answer: "BeanPostProcessor는 빈이 생성되고 주입된 뒤 초기화 전후에 끼어들어 빈을 가공하거나 다른 객체로 바꿀 수 있는 확장 지점입니다. @Autowired, @PostConstruct 처리와 AOP 프록시 생성이 모두 이것으로 동작합니다. 그래서 @Transactional 빈을 주입받으면 실제로는 프록시를 받습니다.",
          analogy: "공장 출하 직전 검수대에서 제품에 보호 포장을 씌워 내보내는 것과 같습니다. 받는 쪽은 포장된 제품을 받습니다.",
          qa: [
            "@Transactional이 붙은 빈은 언제 프록시로 바뀌나요?",
            "빈 생성과 초기화가 끝난 뒤 BeanPostProcessor의 초기화 후 처리 단계에서, 자동 프록시 생성기가 원본 빈을 감싼 프록시를 만들어 원본 대신 컨테이너에 등록합니다. 그래서 다른 빈은 프록시를 주입받게 됩니다."
          ],
          followUps: [
            [
              "@Transactional 빈의 실제 클래스를 확인하면 무엇이 보이나요?",
              "getClass()를 찍으면 원본 클래스 이름 뒤에 $$SpringCGLIB$$가 붙은 프록시 클래스가 보입니다. 초기화 후 단계에서 자동 프록시 생성기가 원본을 프록시로 바꿔 등록했기 때문입니다."
            ]
          ],
          related: ["spring/bin-saengmyeongjugi", "spring/beanfactorypostprocessor"]
        },
        {
          id: "spring/beanfactorypostprocessor",
          slug: "beanfactorypostprocessor",
          title: "BeanFactoryPostProcessor",
          deep: false,
          def: "빈 객체가 만들어지기 전에 빈 정의(BeanDefinition) 자체를 읽고 수정할 수 있는 확장 지점이다.",
          why: "빈이 만들어지기 전에 `${...}` 치환처럼 빈 정의 자체를 바꿔야 하는 작업을 처리하기 위해서다.",
          how: [
            "BeanPostProcessor가 \"만들어진 빈 객체\"를 다룬다면, BeanFactoryPostProcessor는 \"빈의 설계도\"를 다룬다. 실행 시점도 모든 빈 생성보다 앞선다.",
            "- `PropertySourcesPlaceholderConfigurer`: 빈 정의 안의 `${...}` 플레이스홀더를 실제 설정값으로 바꾼다.",
            "- `ConfigurationClassPostProcessor`: `@Configuration`, `@ComponentScan`, `@Import`를 해석해 빈 정의를 추가한다.",
            "애플리케이션 코드에서 직접 구현할 일은 드물지만, 스프링이 설정을 해석하는 원리를 이해하는 데 중요하다."
          ],
          use: ["`${app.timeout}` 같은 설정 플레이스홀더가 `PropertySourcesPlaceholderConfigurer`에 의해 실제 값으로 치환된다."],
          warn: ["`@Bean`으로 등록할 때는 다른 빈보다 먼저 만들어져야 하므로 `static` 메서드로 선언한다."],
          answer: "BeanFactoryPostProcessor는 빈 객체가 만들어지기 전에 빈 정의 자체를 읽고 수정하는 확장 지점입니다. 플레이스홀더를 실제 설정값으로 바꾸거나 @Configuration과 @ComponentScan을 해석해 빈 정의를 추가하는 일이 여기서 일어납니다. 애플리케이션 코드에서 직접 구현할 일은 드뭅니다.",
          analogy: "BeanPostProcessor가 완성품을 손보는 단계라면, 이것은 공장 가동 전에 설계도를 고치는 단계입니다.",
          followUps: [
            [
              "BeanFactoryPostProcessor를 @Bean으로 등록할 때 static으로 선언하는 이유는?",
              "모든 빈보다 먼저 만들어져야 하는데, 인스턴스 메서드면 설정 클래스 빈을 먼저 만들어야 해서 순서가 꼬입니다. static이면 설정 클래스 인스턴스 없이 바로 만들 수 있습니다."
            ]
          ],
          related: ["spring/beanpostprocessor"]
        }
      ]
    }
  ]
};

export default topic;
