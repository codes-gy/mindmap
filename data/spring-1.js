(window.MINDMAP = window.MINDMAP || {})['spring-1'] = {
  name: 'Bean · 컨테이너',
  groups: [
    { name: '스프링 컨테이너', items: [
      { t: 'BeanFactory', deep: false,
        d: '스프링 컨테이너의 최상위 인터페이스로, 빈을 등록하고 `getBean()`으로 조회하는 핵심 기능만 가진다.',
        how: [
          '빈 정의(BeanDefinition)를 보관하고, 요청이 오면 빈을 만들어 의존성을 주입한 뒤 돌려준다.',
          '- 지연 로딩: 빈을 처음 요청할 때 만든다. 그래서 설정 오류가 실제 사용 시점에야 드러날 수 있다.',
          '- 대표 구현체는 `DefaultListableBeanFactory`이며, ApplicationContext도 내부에서 이것을 사용한다.',
          '실무에서 BeanFactory를 직접 쓰는 일은 거의 없고, 부가 기능이 더해진 ApplicationContext를 쓴다.'
        ],
        qa: ['BeanFactory와 ApplicationContext의 차이는?', 'BeanFactory는 빈 생성과 조회만 하는 최소 컨테이너이고 빈을 처음 요청할 때 만듭니다. ApplicationContext는 이를 상속해 이벤트, 메시지, 환경 정보 같은 기능을 더하고 싱글톤을 기동 시점에 미리 만들어 설정 오류를 빨리 발견합니다.'],
        rel: ['ApplicationContext'] },
      { t: 'ApplicationContext', deep: false,
        d: 'BeanFactory를 상속하고 애플리케이션 개발에 필요한 부가 기능을 더한 스프링 컨테이너로, 보통 "스프링 컨테이너"라고 하면 이것을 말한다.',
        how: [
          '- MessageSource: 국제화(i18n) 메시지 처리',
          '- ApplicationEventPublisher: 이벤트 발행과 `@EventListener` 구독',
          '- Environment: 프로필, 프로퍼티 같은 환경 정보',
          '- ResourceLoader: 클래스패스, 파일, URL 리소스 읽기',
          '싱글톤 빈을 기동 시점에 미리 모두 만든다(즉시 로딩). 그래서 의존성 누락 같은 설정 오류를 애플리케이션 시작 단계에서 발견할 수 있다.',
          '스프링 부트 웹 애플리케이션은 `AnnotationConfigServletWebServerApplicationContext`를 쓴다.'
        ],
        rel: ['BeanFactory', '컴포넌트 스캔'] }
    ]},
    { name: '빈 등록', items: [
      { t: '컴포넌트 스캔', deep: false,
        d: '`@Component`가 붙은 클래스를 지정한 패키지에서 찾아 자동으로 빈으로 등록하는 기능이다.',
        how: [
          '`@ComponentScan`이 기준 패키지와 하위 패키지를 훑어 `@Component`(와 이를 포함한 애너테이션)가 붙은 클래스를 찾는다.',
          '- 스프링 부트에서는 `@SpringBootApplication`에 포함되어 있어, 이 클래스가 있는 패키지가 스캔 기준이 된다. 그래서 메인 클래스는 최상위 패키지에 둔다.',
          '- 빈 이름은 클래스 이름의 첫 글자를 소문자로 바꾼 것이다(`OrderService` → `orderService`).',
          '- `includeFilters`, `excludeFilters`로 대상을 조정할 수 있다.',
          '직접 만든 비즈니스 로직 클래스는 컴포넌트 스캔으로 등록하는 것이 일반적이다.'
        ],
        warn: ['메인 클래스보다 상위나 다른 패키지에 있는 클래스는 스캔되지 않아 빈이 없다는 오류가 난다.'],
        rel: ['스테레오타입 애너테이션', '@Bean 수동 등록'] },
      { t: '스테레오타입 애너테이션', deep: false,
        d: '`@Component`를 포함하면서 계층의 역할을 드러내는 `@Controller`, `@Service`, `@Repository`, `@Configuration` 애너테이션이다.',
        how: [
          '모두 내부에 `@Component`를 갖고 있어 컴포넌트 스캔 대상이 된다. 이름으로 역할을 표현하는 것이 주된 목적이다.',
          '- `@Controller`: 스프링 MVC 컨트롤러로 인식되어 요청 매핑 대상이 된다.',
          '- `@Service`: 비즈니스 로직 계층임을 표시한다. 특별한 부가 기능은 없다.',
          '- `@Repository`: 데이터 접근 계층. DB 기술별 예외를 스프링의 `DataAccessException`으로 바꿔 주는 예외 변환이 적용된다.',
          '- `@Configuration`: 설정 클래스. CGLIB 프록시가 적용되어 `@Bean` 싱글톤을 보장한다.'
        ],
        rel: ['컴포넌트 스캔', '@Configuration 프록시'] },
      { t: '@Bean 수동 등록', deep: false,
        d: '`@Configuration` 클래스 안의 메서드에 `@Bean`을 붙여, 그 메서드가 반환한 객체를 빈으로 등록하는 방식이다.',
        how: [
          '빈 이름은 기본적으로 메서드 이름이며 `@Bean(name = "...")`으로 바꿀 수 있다. 다른 빈이 필요하면 메서드 파라미터로 받는다.',
          '- 외부 라이브러리 객체(ObjectMapper, RestClient, DataSource 등)는 클래스에 `@Component`를 붙일 수 없으므로 `@Bean`으로 등록한다.',
          '- 생성 과정에 설정이 많이 필요하거나 조건에 따라 다른 구현을 골라야 할 때 쓴다.',
          '- 설정이 한곳에 모여 어떤 기술 빈이 등록되는지 한눈에 보인다.',
          '같은 이름의 빈이 겹치면 스프링 부트는 기본적으로 오류를 낸다(`spring.main.allow-bean-definition-overriding=false`).'
        ],
        code: `@Configuration
public class ClientConfig {

    @Bean
    public RestClient paymentRestClient(RestClient.Builder builder) {
        return builder.baseUrl("https://api.pay.example.com").build();
    }
}`,
        rel: ['컴포넌트 스캔', '@Configuration 프록시'] }
    ]},
    { name: '빈 스코프', items: [
      { t: '싱글톤 스코프', deep: false,
        d: '컨테이너에 빈 인스턴스를 하나만 만들어 모든 주입 지점에서 공유하는 기본 스코프다.',
        how: [
          '아무 설정이 없으면 모든 빈이 싱글톤이다. 컨테이너가 생성부터 소멸까지 전체 생명주기를 관리한다.',
          '- 장점: 요청마다 객체를 만들지 않아 메모리와 생성 비용을 아낀다.',
          '- 자바의 싱글톤 패턴(private 생성자, static 인스턴스)과 달리 일반 클래스로 만들고 컨테이너가 하나만 유지해 주므로 테스트와 확장이 쉽다(싱글톤 레지스트리).',
          '- 여러 스레드가 동시에 같은 인스턴스를 쓰므로 반드시 무상태로 설계해야 한다.'
        ],
        rel: ['싱글톤과 무상태', '프로토타입 스코프'] },
      { t: '프로토타입 스코프', deep: false,
        d: '빈을 요청할 때마다 새 인스턴스를 만들어 주는 스코프로, `@Scope("prototype")`으로 지정한다.',
        how: [
          '컨테이너는 생성, 의존성 주입, 초기화 콜백까지만 하고 이후에는 관리하지 않는다. 그래서 `@PreDestroy`가 호출되지 않으며 정리는 사용하는 쪽이 책임진다.',
          '- 싱글톤에 주입하면 주입 시점에 한 번만 만들어져 계속 같은 객체가 쓰인다. 프로토타입의 의미가 사라진다.',
          '- 매번 새 객체가 필요하면 `ObjectProvider<T>`를 주입받아 `getObject()`로 그때그때 꺼낸다.',
          '실무에서 쓰이는 경우는 드물고, 상태를 가진 객체가 매번 새로 필요할 때 정도로 한정된다.'
        ],
        warn: ['리소스를 잡는 프로토타입 빈은 소멸 콜백이 없으므로 직접 닫아야 한다.'],
        rel: ['ObjectProvider', '싱글톤 스코프'] },
      { t: 'request 스코프', deep: false,
        d: 'HTTP 요청 하나가 들어와서 나갈 때까지 유지되고, 요청마다 별도 인스턴스가 만들어지는 웹 스코프다.',
        how: [
          '`@RequestScope` 또는 `@Scope("request")`로 지정한다. 요청이 끝나면 소멸 콜백이 호출된다.',
          '- 쓰임: 요청별 추적 ID(UUID)를 저장해 로그에 남기기, 요청 단위로 모으는 정보 보관.',
          '- 기동 시점에는 요청이 없어 싱글톤에 바로 주입하면 오류가 난다. `ObjectProvider`로 꺼내거나 `proxyMode = ScopedProxyMode.TARGET_CLASS`로 가짜 프록시를 주입한다.',
          '- 프록시를 쓰면 메서드를 호출할 때마다 현재 요청의 진짜 빈을 찾아 위임한다.'
        ],
        code: `@Component
@Scope(value = "request", proxyMode = ScopedProxyMode.TARGET_CLASS)
public class RequestTrace {
    private final String traceId = UUID.randomUUID().toString();
    public String traceId() { return traceId; }
}`,
        rel: ['session 스코프', 'ObjectProvider'] },
      { t: 'session 스코프', deep: false,
        d: 'HTTP 세션이 살아 있는 동안 유지되고, 세션마다 별도 인스턴스가 만들어지는 웹 스코프다.',
        how: [
          '`@SessionScope`로 지정한다. 세션이 만료되거나 무효화되면 빈도 소멸한다.',
          '- 쓰임: 로그인 사용자의 장바구니, 다단계 폼의 중간 상태처럼 사용자별로 유지할 데이터.',
          '- request 스코프와 마찬가지로 싱글톤에 주입할 때는 스코프 프록시나 `ObjectProvider`가 필요하다.',
          '- 세션에 저장되므로 서버를 여러 대로 늘리면 세션 공유(Spring Session + Redis)가 필요하고, 직렬화 가능해야 한다.'
        ],
        warn: ['세션 스코프 빈에 큰 데이터를 담으면 사용자 수만큼 메모리를 차지한다.'],
        rel: ['request 스코프'] },
      { t: 'ObjectProvider', deep: false,
        d: '빈을 주입 시점이 아니라 필요한 시점에 컨테이너에서 꺼내 쓰게 해 주는 조회 도구다.',
        how: [
          '`ObjectProvider<T>`를 주입받고 `getObject()`를 호출하면 그때 컨테이너에서 빈을 찾아 준다(Dependency Lookup).',
          '- 프로토타입 빈을 매번 새로 받을 때 쓴다.',
          '- request·session 스코프 빈처럼 기동 시점에 아직 없는 빈을 나중에 꺼낼 때 쓴다.',
          '- `getIfAvailable()`, `getIfUnique()`로 빈이 없거나 여러 개인 경우를 안전하게 처리한다.',
          '자바 표준인 `jakarta.inject.Provider`도 같은 역할을 한다.'
        ],
        code: `@Service
@RequiredArgsConstructor
public class ReportService {
    private final ObjectProvider<ReportBuilder> builderProvider; // prototype 빈

    public Report create() {
        ReportBuilder builder = builderProvider.getObject(); // 호출할 때마다 새 객체
        return builder.build();
    }
}`,
        rel: ['프로토타입 스코프', 'request 스코프'] }
    ]},
    { name: '싱글톤과 무상태', items: [
      { t: '싱글톤과 무상태', deep: true,
        d: '싱글톤 빈은 여러 요청 스레드가 동시에 공유하므로, 요청마다 달라지는 값을 인스턴스 필드에 저장하지 않는 무상태로 설계해야 한다.',
        why: '톰캣은 요청마다 다른 스레드로 같은 빈 인스턴스의 메서드를 동시에 실행한다. 필드에 상태를 두면 한 사용자의 값이 다른 사용자의 값으로 덮어써지는 동시성 버그가 생긴다.',
        how: [
          '1) 사용자 A의 요청 스레드가 `this.price = 10000`을 저장한다.',
          '2) 거의 동시에 사용자 B의 요청 스레드가 같은 인스턴스에 `this.price = 20000`을 저장한다.',
          '3) A의 스레드가 `this.price`를 읽으면 20000이 나온다. A가 B의 금액으로 결제하게 된다.',
          '이런 버그는 로컬에서 혼자 테스트할 때는 재현되지 않고 트래픽이 몰릴 때만 간헐적으로 나타나 찾기 매우 어렵다.',
          '- 필드에는 다른 빈(의존성)이나 변하지 않는 설정값만 둔다. `final`로 선언하면 실수를 막기 쉽다.',
          '- 요청별 값은 지역 변수, 파라미터, 반환값으로 주고받는다. 지역 변수는 스레드마다 별도의 스택에 있어 안전하다.',
          '- 공유 상태가 꼭 필요하면 `ConcurrentHashMap`, `AtomicLong` 같은 스레드 안전한 자료구조를 쓴다.'
        ],
        code: `@Service
public class PriceService {
    // 잘못된 예: 요청마다 바뀌는 값을 필드에 저장
    private int price;
    public void order(int amount) { this.price = amount; /* ... */ }

    // 올바른 예: 지역 변수와 반환값으로만 다룬다
    public int calculate(int amount, int discount) {
        int price = amount - discount;
        return price;
    }
}`,
        warn: [
          '`SimpleDateFormat`처럼 스레드 안전하지 않은 객체를 필드로 공유하지 않는다. `DateTimeFormatter`는 불변이라 안전하다.',
          '컨트롤러도 싱글톤이므로 같은 규칙이 적용된다.',
          'ThreadLocal로 요청별 값을 보관했다면 요청이 끝날 때 반드시 `remove()`한다.'
        ],
        qa: ['싱글톤 빈이 스레드 안전하지 않은 경우는 언제인가요?', '싱글톤 빈 자체는 하나지만 여러 요청 스레드가 동시에 같은 인스턴스를 실행합니다. 그래서 인스턴스 필드에 요청마다 바뀌는 값을 저장하면 다른 스레드가 덮어써 데이터가 섞입니다. 필드에는 의존성과 불변 값만 두고, 요청별 데이터는 지역 변수나 파라미터로 다뤄 무상태로 설계해야 합니다.'],
        rel: ['싱글톤 스코프'] }
    ]},
    { name: '빈 생명주기', items: [
      { t: '빈 생명주기', deep: true,
        d: '싱글톤 빈은 컨테이너 생성 → 빈 생성 → 의존관계 주입 → 초기화 콜백 → 사용 → 소멸 전 콜백 → 컨테이너 종료 순서로 관리된다.',
        why: '객체 생성과 초기화를 분리해야 의존성이 모두 준비된 뒤에 안전하게 초기화할 수 있고, 종료 시 연결과 스레드 같은 자원을 확실히 정리할 수 있기 때문이다.',
        how: [
          '1) 스프링 컨테이너 생성: 설정 정보를 읽어 빈 정의를 등록한다.',
          '2) 빈 생성: 생성자를 호출해 객체를 만든다. 생성자 주입이면 이때 의존성도 함께 들어온다.',
          '3) 의존관계 주입: 세터·필드 주입 대상에 빈을 넣는다.',
          '4) BeanPostProcessor 초기화 전 처리.',
          '5) 초기화 콜백: `@PostConstruct` → `InitializingBean.afterPropertiesSet()` → `@Bean(initMethod)` 순서로 호출된다.',
          '6) BeanPostProcessor 초기화 후 처리: AOP 프록시가 여기서 만들어져 원본 대신 등록된다.',
          '7) 사용.',
          '8) 컨테이너 종료 시 소멸 전 콜백: `@PreDestroy` → `DisposableBean.destroy()` → `destroyMethod` 순서.',
          '세터·필드 주입이면 생성자 안에서는 의존성이 아직 없다. 그래서 외부 연결, 캐시 미리 채우기 같은 초기화는 생성자가 아니라 초기화 콜백에서 한다.'
        ],
        code: `@Component
public class ExchangeRateCache {
    private final ExchangeRateClient client;
    private final Map<String, BigDecimal> rates = new ConcurrentHashMap<>();

    public ExchangeRateCache(ExchangeRateClient client) { this.client = client; } // 생성만

    @PostConstruct
    void load() { rates.putAll(client.fetchAll()); } // 의존성 준비 후 초기화

    @PreDestroy
    void clear() { rates.clear(); } // 종료 전 정리
}`,
        warn: [
          '`@PostConstruct` 시점에는 아직 AOP 프록시가 적용되기 전이라 `@Transactional`이 동작하지 않는다. 트랜잭션이 필요한 초기화는 `ApplicationReadyEvent` 리스너에서 한다.',
          '프로토타입 빈은 소멸 콜백이 호출되지 않는다.',
          '`kill -9`처럼 강제 종료하면 소멸 콜백이 실행되지 않는다. 부트는 `server.shutdown=graceful`로 우아한 종료를 지원한다.'
        ],
        qa: ['스프링 빈의 생명주기와 초기화 콜백 방법을 설명해 주세요.', '컨테이너가 빈을 생성하고 의존관계를 주입한 뒤 초기화 콜백을 호출하고, 사용 후 컨테이너 종료 시 소멸 콜백을 호출합니다. 초기화와 소멸은 자바 표준인 @PostConstruct와 @PreDestroy를 주로 쓰고, 코드를 고칠 수 없는 외부 라이브러리는 @Bean의 initMethod와 destroyMethod를 씁니다. 생성자에서는 의존성이 다 준비되지 않았을 수 있어 무거운 초기화는 콜백에서 합니다.'],
        rel: ['@PostConstruct', '@PreDestroy', 'initMethod/destroyMethod', 'BeanPostProcessor'] },
      { t: '@PostConstruct', deep: false,
        d: '의존관계 주입이 끝난 직후 한 번 호출할 초기화 메서드를 지정하는 자바 표준(jakarta.annotation) 애너테이션이다.',
        how: [
          '메서드에 붙이기만 하면 되어 가장 간단하고, 스프링에 종속되지 않아 권장되는 방법이다.',
          '- 쓰임: 캐시 미리 채우기, 설정값 검증, 외부 연결 준비.',
          '- 스프링 부트 3부터 패키지가 `javax.annotation`에서 `jakarta.annotation`으로 바뀌었다.',
          '- 실제 호출은 CommonAnnotationBeanPostProcessor가 담당한다.'
        ],
        warn: ['이 시점에는 프록시가 적용되기 전이라 `@Transactional`, `@Async`가 동작하지 않는다.'],
        rel: ['빈 생명주기', '@PreDestroy'] },
      { t: '@PreDestroy', deep: false,
        d: '컨테이너가 종료되면서 빈이 소멸되기 직전에 호출할 정리 메서드를 지정하는 자바 표준 애너테이션이다.',
        how: [
          '연결 닫기, 스레드 풀 종료, 임시 파일 삭제처럼 자원을 정리하는 데 쓴다.',
          '- 싱글톤 빈은 컨테이너 종료 시 호출된다. 웹 스코프 빈은 요청·세션이 끝날 때 호출된다.',
          '- 프로토타입 빈은 컨테이너가 소멸을 관리하지 않아 호출되지 않는다.',
          '- 정상 종료(SIGTERM)에서만 실행되고 강제 종료(SIGKILL)에서는 실행되지 않는다.'
        ],
        rel: ['빈 생명주기', '@PostConstruct', '프로토타입 스코프'] },
      { t: 'initMethod/destroyMethod', deep: false,
        d: '`@Bean(initMethod = "init", destroyMethod = "close")`처럼 등록 시점에 초기화·소멸 메서드 이름을 지정하는 방식이다.',
        how: [
          '빈 클래스 코드를 고칠 수 없는 외부 라이브러리 객체에 초기화·소멸 메서드를 연결할 때 쓴다.',
          '- 메서드 이름만 지정하므로 클래스가 스프링 인터페이스에 의존하지 않는다.',
          '- `destroyMethod`의 기본값은 추론(inferred)이라 `close`나 `shutdown`이라는 public 메서드가 있으면 자동으로 호출된다. 원치 않으면 `destroyMethod = ""`로 끈다.',
          '`InitializingBean`/`DisposableBean` 인터페이스 방식은 코드가 스프링에 묶여 요즘은 거의 쓰지 않는다.'
        ],
        code: `@Bean(initMethod = "connect", destroyMethod = "disconnect")
public LegacyMqClient mqClient() {
    return new LegacyMqClient("mq.internal:5672");
}`,
        rel: ['빈 생명주기', '@Bean 수동 등록'] }
    ]},
    { name: '설정 클래스 프록시', items: [
      { t: '@Configuration 프록시', deep: false,
        d: '스프링이 `@Configuration` 클래스를 CGLIB으로 상속한 프록시로 바꿔 등록해, `@Bean` 메서드를 여러 번 호출해도 같은 싱글톤을 돌려주는 기능이다.',
        how: [
          '`@Bean` 메서드 안에서 다른 `@Bean` 메서드를 호출하면 자바 코드상으로는 객체가 매번 새로 생길 것처럼 보인다.',
          '실제로는 등록된 빈이 `AppConfig$$SpringCGLIB$$0` 같은 프록시이고, 프록시가 `@Bean` 메서드 호출을 가로채 컨테이너에 그 빈이 이미 있으면 기존 빈을 돌려준다.',
          '- 그래서 `memberRepository()`를 두 서비스 빈 메서드에서 호출해도 리포지토리는 하나만 생긴다.',
          '- `@Component` 클래스 안의 `@Bean`(lite 모드)은 프록시가 없어 메서드를 직접 호출하면 새 객체가 생긴다.'
        ],
        code: `@Configuration
public class AppConfig {
    @Bean public MemberRepository memberRepository() { return new MemoryMemberRepository(); }
    @Bean public MemberService memberService() { return new MemberService(memberRepository()); }
    @Bean public OrderService orderService() { return new OrderService(memberRepository()); }
    // memberRepository()가 두 번 호출되지만 같은 인스턴스가 주입된다
}`,
        rel: ['proxyBeanMethods', '@Bean 수동 등록'] },
      { t: 'proxyBeanMethods', deep: false,
        d: '`@Configuration(proxyBeanMethods = false)`로 설정 클래스의 CGLIB 프록시 생성을 끄는 옵션이다.',
        how: [
          '프록시를 만들지 않으므로 기동 속도와 메모리에서 조금 이득이 있고, GraalVM 네이티브 이미지에도 유리하다.',
          '- 대신 `@Bean` 메서드를 직접 호출하면 매번 새 객체가 생긴다. 다른 빈이 필요하면 메서드 호출 대신 메서드 파라미터로 주입받아야 한다.',
          '- 스프링 부트의 자동 설정 클래스들은 모두 `proxyBeanMethods = false`를 쓰고 파라미터 주입 방식을 따른다.'
        ],
        code: `@Configuration(proxyBeanMethods = false)
public class AppConfig {
    @Bean public MemberRepository memberRepository() { return new MemoryMemberRepository(); }
    @Bean public MemberService memberService(MemberRepository repo) { return new MemberService(repo); }
}`,
        rel: ['@Configuration 프록시'] }
    ]},
    { name: '컨테이너 확장 지점', items: [
      { t: 'BeanPostProcessor', deep: false,
        d: '빈이 생성되고 의존성이 주입된 뒤 초기화 전후에 끼어들어 빈을 조작하거나 다른 객체로 바꿔 반환할 수 있는 확장 지점이다.',
        how: [
          '`postProcessBeforeInitialization`은 초기화 콜백 전에, `postProcessAfterInitialization`은 초기화 콜백 후에 모든 빈에 대해 호출된다. 반환한 객체가 원본 대신 컨테이너에 등록된다.',
          '- `@Autowired` 처리: AutowiredAnnotationBeanPostProcessor',
          '- `@PostConstruct`, `@PreDestroy` 처리: CommonAnnotationBeanPostProcessor',
          '- AOP 프록시 생성: AnnotationAwareAspectJAutoProxyCreator가 초기화 후 단계에서 원본 대신 프록시를 등록한다.',
          '그래서 `@Transactional`이 붙은 빈을 주입받으면 실제로는 원본이 아니라 프록시 객체를 받는다.'
        ],
        qa: ['@Transactional이 붙은 빈은 언제 프록시로 바뀌나요?', '빈 생성과 초기화가 끝난 뒤 BeanPostProcessor의 초기화 후 처리 단계에서, 자동 프록시 생성기가 원본 빈을 감싼 프록시를 만들어 원본 대신 컨테이너에 등록합니다. 그래서 다른 빈은 프록시를 주입받게 됩니다.'],
        rel: ['빈 생명주기', 'BeanFactoryPostProcessor'] },
      { t: 'BeanFactoryPostProcessor', deep: false,
        d: '빈 객체가 만들어지기 전에 빈 정의(BeanDefinition) 자체를 읽고 수정할 수 있는 확장 지점이다.',
        how: [
          'BeanPostProcessor가 "만들어진 빈 객체"를 다룬다면, BeanFactoryPostProcessor는 "빈의 설계도"를 다룬다. 실행 시점도 모든 빈 생성보다 앞선다.',
          '- `PropertySourcesPlaceholderConfigurer`: 빈 정의 안의 `${...}` 플레이스홀더를 실제 설정값으로 바꾼다.',
          '- `ConfigurationClassPostProcessor`: `@Configuration`, `@ComponentScan`, `@Import`를 해석해 빈 정의를 추가한다.',
          '애플리케이션 코드에서 직접 구현할 일은 드물지만, 스프링이 설정을 해석하는 원리를 이해하는 데 중요하다.'
        ],
        warn: ['`@Bean`으로 등록할 때는 다른 빈보다 먼저 만들어져야 하므로 `static` 메서드로 선언한다.'],
        rel: ['BeanPostProcessor'] }
    ]}
  ],
  must: [
    '싱글톤 빈에 요청마다 바뀌는 값을 필드로 두지 않는다. 가장 흔한 동시성 버그다.',
    '싱글톤에 주입한 prototype 빈은 처음 한 번만 만들어진다. 매번 새로 받으려면 `ObjectProvider`를 쓴다.',
    'prototype 빈은 컨테이너가 소멸을 관리하지 않아 `@PreDestroy`가 호출되지 않는다.',
    '`@PostConstruct` 안에서는 아직 프록시가 적용되지 않아 `@Transactional`이 동작하지 않는다.'
  ]
};
