(window.MINDMAP = window.MINDMAP || {})['spring-9'] = {
  name: '테스트',
  groups: [
    { name: '통합 테스트', items: [
      { t: '@SpringBootTest', deep: true,
        d: '실제 애플리케이션과 거의 같은 전체 ApplicationContext를 띄워 여러 계층을 함께 검증하는 통합 테스트 애너테이션이다.',
        why: '실제 운영과 같은 설정과 빈 구성으로 계층 사이의 연결(설정, 트랜잭션, 직렬화, DB 매핑)이 맞물려 동작하는지는 단위 테스트로 확인할 수 없기 때문이다.',
        how: [
          '1) 스프링 테스트 확장(SpringExtension)이 테스트 클래스의 설정, 프로필, 프로퍼티, 목 빈 구성을 모아 컨텍스트 캐시 키를 만든다.',
          '2) 같은 키의 컨텍스트가 캐시에 있으면 재사용하고, 없으면 `SpringApplication`과 같은 방식으로 전체 컨텍스트를 만든다.',
          '3) 테스트 인스턴스의 `@Autowired` 필드에 빈을 주입하고 테스트 메서드를 실행한다.',
          '4) 테스트에 `@Transactional`이 있으면 메서드마다 트랜잭션을 열고 끝나면 롤백한다.',
          '테스트 클래스의 패키지에서 위로 올라가며 `@SpringBootApplication`을 찾아 그 설정으로 컨텍스트를 만든다.',
          '모든 빈, 자동 설정, 설정 파일이 로드되므로 컨트롤러부터 DB까지 실제 연동을 끝까지 확인할 수 있다.',
          '- `webEnvironment = MOCK`(기본): 실제 서버 없이 Mock 서블릿 환경. MockMvc와 함께 쓴다.',
          '- `webEnvironment = RANDOM_PORT`: 실제 내장 톰캣을 임의 포트로 띄운다.',
          '단점은 기동이 느리다는 것이다. 설정이 같은 테스트끼리는 컨텍스트 캐시로 재사용된다.'
        ],
        code: `@SpringBootTest
@AutoConfigureMockMvc
class OrderApiTest {
    @Autowired MockMvc mockMvc;

    @Test
    void 주문_생성() throws Exception {
        mockMvc.perform(post("/orders").contentType(APPLICATION_JSON)
                .content("{\\"productId\\":1,\\"quantity\\":2}"))
               .andExpect(status().isCreated());
    }
}`,
        warn: ['모든 테스트를 `@SpringBootTest`로 쓰면 테스트 시간이 길어진다. 로직 검증은 단위 테스트로, 계층별 검증은 슬라이스 테스트로 나눈다.'],
        qa: ['통합 테스트와 슬라이스 테스트는 어떻게 나눠 쓰나요?', '전체 흐름과 설정까지 실제처럼 확인해야 하는 핵심 시나리오는 @SpringBootTest로 적게 둡니다. 컨트롤러의 요청·응답 형식은 @WebMvcTest, 쿼리는 @DataJpaTest처럼 필요한 계층만 띄워 빠르게 검증합니다. 비즈니스 로직은 스프링 없이 단위 테스트로 작성합니다.'],
        rel: ['RANDOM_PORT 테스트', '컨텍스트 캐시', '@WebMvcTest', '@DataJpaTest'] },
      { t: 'RANDOM_PORT 테스트', deep: false,
        d: '`@SpringBootTest(webEnvironment = RANDOM_PORT)`로 실제 내장 서버를 임의 포트에 띄워 진짜 HTTP 요청으로 검증하는 방식이다.',
        how: [
          '포트 충돌을 피하려고 매번 빈 포트를 고르며, `@LocalServerPort`로 포트 번호를 받을 수 있다.',
          '`TestRestTemplate`, `WebTestClient`, `RestClient`로 실제 네트워크를 통해 호출하므로 필터, 직렬화, 에러 응답까지 운영과 같은 경로를 탄다.',
          '테스트 코드와 서버가 서로 다른 스레드에서 실행된다.'
        ],
        warn: ['테스트 메서드의 `@Transactional`은 서버 스레드의 트랜잭션과 별개라 서버가 저장한 데이터가 롤백되지 않는다. 테스트 후 데이터를 직접 정리한다.'],
        rel: ['@SpringBootTest', '테스트 데이터 정리'] },
      { t: '@ActiveProfiles', deep: false,
        d: '테스트 실행 시 사용할 스프링 프로필을 지정하는 애너테이션이다.',
        how: [
          '`@ActiveProfiles("test")`를 붙이면 application-test.yml이 추가로 로드되어 테스트 전용 DB, 외부 API 주소, 로그 레벨을 쓸 수 있다.',
          '`@Profile("!test")`를 붙인 빈은 테스트에서 등록되지 않아, 실제 메일 발송 같은 빈을 테스트에서 제외할 수 있다.',
          '- 여러 프로필을 함께 켤 수 있다: `@ActiveProfiles({"test", "mock-payment"})`.',
          '- 공통 부모 테스트 클래스에 한 번만 붙이면 모든 테스트가 같은 프로필을 써서 컨텍스트 캐시도 재사용된다.',
          '- 프로필을 지정해도 기본 application.yml은 항상 먼저 로드되고, 프로필 파일이 같은 키를 덮어쓴다.'
        ],
        warn: ['테스트 클래스마다 다른 프로필을 쓰면 컨텍스트 캐시를 재사용하지 못한다. 공통 프로필로 통일한다.'],
        rel: ['컨텍스트 캐시'] }
    ]},
    { name: '슬라이스 테스트', items: [
      { t: '@WebMvcTest', deep: false,
        d: '스프링 MVC 계층(컨트롤러, 필터, 컨버터, 예외 처리)에 필요한 빈만 로드해 웹 계층을 빠르게 검증하는 슬라이스 테스트다.',
        how: [
          '`@WebMvcTest(UserController.class)`처럼 대상을 지정하면 그 컨트롤러와 `@ControllerAdvice`, Filter, `WebMvcConfigurer`, MessageConverter만 등록된다.',
          '서비스와 리포지토리는 로드되지 않으므로 `@MockitoBean`으로 대체한다.',
          'MockMvc가 자동으로 설정되어 요청 매핑, `@Valid` 검증, JSON 직렬화, 상태 코드를 검증한다.',
          '스프링 시큐리티가 있으면 시큐리티 필터도 함께 적용된다.'
        ],
        code: `@WebMvcTest(UserController.class)
class UserControllerTest {
    @Autowired MockMvc mockMvc;
    @MockitoBean UserService userService;

    @Test
    void 이메일_형식이_틀리면_400() throws Exception {
        mockMvc.perform(post("/users").contentType(APPLICATION_JSON)
                .content("{\\"email\\":\\"wrong\\"}"))
               .andExpect(status().isBadRequest());
    }
}`,
        rel: ['MockMvc', '@MockitoBean', '@DataJpaTest'] },
      { t: '@DataJpaTest', deep: false,
        d: 'JPA 관련 빈(엔티티, 리포지토리, EntityManager)만 로드해 쿼리와 매핑을 검증하는 슬라이스 테스트다.',
        how: [
          '기본으로 내장 DB(H2 등)로 데이터소스를 바꾸고, 각 테스트를 트랜잭션으로 감싸 끝나면 롤백한다.',
          '`TestEntityManager`로 테스트 데이터를 넣고 `flush()`, `clear()`로 영속성 컨텍스트를 비워 실제 SQL이 나가는지 확인할 수 있다.',
          '실제 DB(MySQL 등)를 쓰려면 `@AutoConfigureTestDatabase(replace = Replace.NONE)`과 Testcontainers를 함께 쓴다.'
        ],
        warn: ['영속성 컨텍스트 1차 캐시 때문에 저장 직후 조회하면 SQL이 나가지 않는다. 쿼리를 검증하려면 `flush()` 후 `clear()`한다.'],
        rel: ['Testcontainers', '테스트의 @Transactional'] },
      { t: '@JsonTest', deep: false,
        d: 'Jackson 직렬화·역직렬화 설정만 로드해 JSON 변환 결과를 검증하는 슬라이스 테스트다.',
        how: [
          '`JacksonTester<T>`를 주입받아 객체 → JSON, JSON → 객체 변환 결과를 확인한다.',
          '날짜 형식, 필드 이름 규칙(snake_case), null 제외 같은 직렬화 설정이 의도대로 동작하는지 빠르게 검증할 때 쓴다.',
          '- 부트의 `spring.jackson.*` 설정, `@JsonComponent`, Jackson 모듈이 적용된 ObjectMapper가 로드된다. 서비스나 리포지토리 빈은 로드되지 않는다.',
          '- `json.write(dto)` 결과에서 JSON 경로로 필드를 확인하고, `json.parse(content)`로 역직렬화 결과를 확인한다.',
          '- API 응답 형식을 바꿀 때 하위 호환이 깨지지 않았는지 확인하는 회귀 테스트로 유용하다.'
        ],
        code: `@JsonTest
class OrderResponseJsonTest {
    @Autowired JacksonTester<OrderResponse> json;

    @Test
    void 날짜는_ISO_형식으로_직렬화() throws Exception {
        var res = new OrderResponse(1L, LocalDate.of(2026, 10, 23));
        assertThat(json.write(res))
            .extractingJsonPathStringValue("$.orderDate").isEqualTo("2026-10-23");
    }
}`,
        rel: ['@WebMvcTest'] },
      { t: '@RestClientTest', deep: false,
        d: '외부 API를 호출하는 클라이언트 빈만 로드하고, 실제 서버 대신 MockRestServiceServer로 응답을 흉내 내는 슬라이스 테스트다.',
        how: [
          '`RestTemplate`이나 `RestClient.Builder` 기반 클라이언트를 대상으로 한다.',
          '`MockRestServiceServer`에 "이 URL로 요청이 오면 이 JSON을 응답"하도록 설정하고, 요청 URL·헤더·본문이 올바른지와 응답 처리 로직을 검증한다.',
          '- `@RestClientTest(PaymentClient.class)`처럼 대상을 지정하면 그 빈과 Jackson, `RestTemplateBuilder`, `RestClient.Builder`만 등록된다.',
          '- 외부 서버가 4xx·5xx를 돌려줄 때 예외 변환과 재시도 로직이 의도대로 동작하는지 실제 서버 없이 검증한다.',
          '- `WebClient`는 지원하지 않으므로 MockWebServer나 WireMock을 쓴다.'
        ],
        rel: ['@MockitoBean'] }
    ]},
    { name: 'MockMvc', items: [
      { t: 'MockMvc', deep: false,
        d: '실제 서버를 띄우지 않고 DispatcherServlet에 가짜 HTTP 요청을 보내 웹 계층을 테스트하는 도구다.',
        how: [
          '네트워크를 거치지 않아 빠르면서도 필터, 인터셉터, ArgumentResolver, MessageConverter, 예외 처리까지 실제와 같은 흐름을 탄다.',
          '`perform()`으로 요청을 만들고 `andExpect()`로 상태 코드, 헤더, `jsonPath()`로 응답 본문을 검증한다.',
          '`@WebMvcTest`에서는 자동 설정되고, `@SpringBootTest`에서는 `@AutoConfigureMockMvc`를 붙여 주입받는다.'
        ],
        code: `mockMvc.perform(get("/users/{id}", 1L))
       .andExpect(status().isOk())
       .andExpect(jsonPath("$.name").value("홍길동"))
       .andDo(print());`,
        rel: ['MockMvcTester', '@WebMvcTest', '@WithMockUser'] },
      { t: 'MockMvcTester', deep: false,
        d: '스프링 6.2에서 추가된 AssertJ 스타일의 MockMvc 래퍼다.',
        how: [
          '체크 예외를 던지지 않고, `assertThat(mvc.get().uri("/users/1"))` 형태로 응답을 AssertJ 문법으로 검증한다.',
          '`hasStatusOk()`, `bodyJson().extractingPath("$.name").isEqualTo(...)`처럼 읽기 쉬운 검증을 제공한다.',
          '기존 MockMvc 테스트와 함께 쓸 수 있다.'
        ],
        rel: ['MockMvc'] },
      { t: '@WithMockUser', deep: false,
        d: '스프링 시큐리티 테스트에서 인증된 사용자가 요청한 것처럼 SecurityContext를 채워 주는 애너테이션이다.',
        how: [
          '`@WithMockUser(username = "admin", roles = "ADMIN")`을 테스트 메서드에 붙이면 로그인 과정 없이 해당 권한의 사용자로 요청한다.',
          '권한별 접근 제어(403)와 인증 필요 여부(401)를 검증할 때 쓴다.',
          '직접 만든 사용자 객체가 필요하면 `@WithUserDetails`나 커스텀 `@WithSecurityContext`를 쓴다.'
        ],
        warn: ['CSRF가 켜져 있으면 POST 요청에 `.with(csrf())`를 붙여야 403이 나지 않는다.'],
        rel: ['MockMvc'] }
    ]},
    { name: '목 빈 · 컨텍스트', items: [
      { t: '@MockitoBean', deep: false,
        d: '스프링 컨텍스트 안의 빈을 Mockito 목 객체로 바꿔치기하는 애너테이션이다(스프링 6.2, 부트 3.4+).',
        how: [
          '외부 결제 API, 메일 발송처럼 테스트에서 실제로 호출하면 안 되는 빈을 대체할 때 쓴다.',
          '`given(paymentClient.pay(any())).willReturn(...)`으로 동작을 정하고 `verify()`로 호출 여부를 검증한다.',
          '기존 부트의 `@MockBean`은 deprecated되었고 이것으로 대체되었다.'
        ],
        warn: ['테스트 클래스마다 목으로 바꾸는 빈이 다르면 컨텍스트를 새로 만들어 테스트가 느려진다.'],
        rel: ['@MockitoSpyBean', '컨텍스트 캐시', '순수 단위 테스트'] },
      { t: '@MockitoSpyBean', deep: false,
        d: '실제 빈을 그대로 쓰되 일부 메서드만 가짜 동작으로 바꾸거나 호출을 기록하는 스파이로 감싸는 애너테이션이다.',
        how: [
          '기본적으로 실제 메서드가 실행되고, 원하는 메서드만 `doReturn(...).when(spy).method()`로 바꾼다.',
          '"실제 로직은 그대로 두고 특정 외부 호출만 막고 싶을 때"나 "실제로 몇 번 호출되었는지 확인하고 싶을 때" 쓴다.',
          '기존 `@SpyBean`을 대체한다.'
        ],
        rel: ['@MockitoBean'] },
      { t: '컨텍스트 캐시', deep: true,
        d: '스프링 테스트가 설정이 같은 ApplicationContext를 한 번만 만들고 여러 테스트 클래스에서 재사용하는 기능이다.',
        why: '컨텍스트를 만드는 데 수 초에서 수십 초가 걸린다. 테스트 클래스마다 새로 만들면 전체 테스트 시간이 클래스 수만큼 늘어나므로, 구성이 같으면 한 번 만든 것을 재사용한다.',
        how: [
          '1) 테스트 클래스마다 설정 클래스, 활성 프로필, 프로퍼티, `@MockitoBean` 구성 등을 모아 캐시 키(`MergedContextConfiguration`)를 만든다.',
          '2) 같은 키가 캐시에 있으면 그 컨텍스트를 그대로 쓴다.',
          '3) 없으면 새로 만들어 캐시에 넣는다. 캐시는 테스트를 실행하는 JVM 안에서만 유지되고 기본 최대 32개다.',
          '4) `@DirtiesContext`가 붙은 테스트가 끝나면 해당 컨텍스트를 닫고 캐시에서 뺀다.',
          '설정 클래스, 프로필, 프로퍼티, 목 빈 구성 등이 모두 같으면 같은 컨텍스트로 판단해 재사용한다.',
          '하나라도 다르면 새 컨텍스트를 만든다. 테스트가 느린 가장 흔한 원인이 이 캐시 미스다.',
          '- 목 빈 선언을 공통 추상 테스트 클래스에 모아 구성을 통일한다.',
          '- 프로필과 테스트 프로퍼티를 클래스마다 다르게 두지 않는다.',
          '로그 레벨을 debug로 두면 컨텍스트 캐시 적중 통계를 확인할 수 있다.'
        ],
        code: `// 목 빈과 프로필을 한곳에 모아 모든 통합 테스트가 같은 컨텍스트를 쓰게 한다
@SpringBootTest
@ActiveProfiles("test")
public abstract class IntegrationTestSupport {
    @MockitoBean protected PaymentClient paymentClient;
    @MockitoBean protected MailSender mailSender;
}

class OrderServiceIT extends IntegrationTestSupport { /* ... */ }
class MemberServiceIT extends IntegrationTestSupport { /* ... */ }`,
        qa: ['통합 테스트가 너무 느린데 원인을 어떻게 찾고 줄이나요?', '먼저 테스트 로그에서 스프링 기동 로그가 몇 번 찍히는지 보면 컨텍스트가 몇 번 만들어지는지 알 수 있습니다. 클래스마다 다른 @MockitoBean, 프로필, 프로퍼티와 @DirtiesContext가 주된 원인이라 이를 공통 부모 클래스로 모아 구성을 통일합니다. 그래도 느리면 일부 통합 테스트를 슬라이스 테스트나 단위 테스트로 옮깁니다.'],
        rel: ['@DirtiesContext', '@MockitoBean'] },
      { t: '@DirtiesContext', deep: false,
        d: '테스트가 컨텍스트 상태를 오염시켰다고 표시해, 캐시된 컨텍스트를 버리고 다음 테스트에서 새로 만들게 하는 애너테이션이다.',
        how: [
          '싱글톤 빈의 상태를 바꾸는 테스트 뒤에 붙여 다른 테스트에 영향이 가지 않게 한다.',
          '`classMode`, `methodMode`로 언제 버릴지 정한다.',
          '- 쓰는 경우: 싱글톤 빈의 내부 캐시나 상태를 바꾸는 테스트, 컨텍스트 안 스케줄러나 메시지 리스너의 상태를 바꾸는 테스트.',
          '- 기본값은 테스트 클래스가 끝난 뒤(`AFTER_CLASS`) 버린다. `AFTER_EACH_TEST_METHOD`로 지정하면 메서드마다 새로 만들어 매우 느려진다.',
          '- 대안: 상태를 가진 빈에 초기화 메서드를 두고 `@AfterEach`에서 되돌린다.'
        ],
        warn: ['컨텍스트를 다시 만드는 비용이 커서 테스트 시간이 크게 늘어난다. 꼭 필요한 경우에만 쓰고, 가능하면 상태를 초기화하는 방식으로 바꾼다.'],
        rel: ['컨텍스트 캐시'] },
      { t: '순수 단위 테스트', deep: false,
        d: '스프링 컨텍스트 없이 대상 클래스를 직접 생성해 로직만 검증하는 테스트다.',
        how: [
          '`@ExtendWith(MockitoExtension.class)`와 `@Mock`, `@InjectMocks`로 의존성을 목으로 넣거나, 생성자 주입이면 `new OrderService(fakeRepo)`로 직접 만든다.',
          '컨텍스트를 띄우지 않아 밀리초 단위로 실행되어 많은 경우를 빠르게 검증할 수 있다.',
          '테스트 피라미드의 가장 넓은 바닥을 이루며, 비즈니스 로직은 대부분 여기서 검증한다.'
        ],
        code: `@ExtendWith(MockitoExtension.class)
class OrderServiceTest {
    @Mock OrderRepository orderRepository;
    @InjectMocks OrderService orderService;

    @Test
    void 재고가_없으면_예외() {
        assertThatThrownBy(() -> orderService.order(1L, 0))
            .isInstanceOf(IllegalArgumentException.class);
    }
}`,
        rel: ['@MockitoBean'] }
    ]},
    { name: '테스트 데이터 · 트랜잭션', items: [
      { t: '테스트의 @Transactional', deep: true,
        d: '테스트 메서드나 클래스에 붙이면 각 테스트가 트랜잭션 안에서 실행되고 끝나면 자동으로 롤백된다.',
        why: '테스트마다 DB를 처음 상태로 되돌려 테스트끼리 데이터가 섞이지 않게 하기 위해서다. 다만 운영 흐름과 다른 점을 알고 써야 한다.',
        how: [
          '1) `TransactionalTestExecutionListener`가 테스트 메서드 시작 전에 트랜잭션을 연다.',
          '2) 테스트 코드와, 같은 스레드에서 호출된 서비스의 `REQUIRED` 트랜잭션이 모두 이 트랜잭션에 참여한다.',
          '3) 테스트가 끝나면 기본으로 롤백한다. `@Commit`이나 `@Rollback(false)`가 있으면 커밋한다.',
          '테스트끼리 데이터가 섞이지 않게 하는 편리한 방법이다. 커밋하려면 `@Commit`을 붙인다.',
          '운영 흐름과 달라지는 점이 있다.',
          '- 테스트 전체가 하나의 영속성 컨텍스트를 공유해, 운영에서 날 `LazyInitializationException`이 테스트에서는 나지 않는다.',
          '- 커밋되지 않아 플러시가 일어나지 않으면 제약 조건 위반이나 UPDATE 쿼리가 검증되지 않는다. 필요하면 `em.flush()`를 호출한다.',
          '- `REQUIRES_NEW`, `@Async`, RANDOM_PORT 서버 호출은 테스트 트랜잭션 밖이라 롤백되지 않는다.'
        ],
        code: `@DataJpaTest
class MemberRepositoryTest {
    @Autowired MemberRepository memberRepository;
    @Autowired EntityManager em;

    @Test
    void 이름_변경() {
        Member member = memberRepository.save(new Member("홍길동"));
        member.changeName("김철수");

        em.flush(); // 변경 감지로 UPDATE를 실제로 실행한다
        em.clear(); // 1차 캐시를 비워 DB에서 다시 읽게 한다

        assertThat(memberRepository.findById(member.getId()).get().getName())
            .isEqualTo("김철수");
    } // 끝나면 롤백된다
}`,
        warn: ['테스트가 통과해도 실제 커밋 흐름의 문제를 놓칠 수 있다. 핵심 시나리오는 롤백 없이 실행하고 데이터를 직접 정리하는 방식도 함께 쓴다.'],
        qa: ['테스트에 @Transactional을 붙일 때 주의점은?', '테스트가 끝나면 롤백되어 편리하지만 영속성 컨텍스트가 테스트 내내 열려 있어 지연 로딩 예외 같은 운영 문제를 가릴 수 있습니다. 또 플러시가 일어나지 않으면 실제 SQL과 제약 조건이 검증되지 않습니다. 그래서 필요할 때 flush를 직접 호출하거나, 트랜잭션 없이 실행하고 테스트 후 데이터를 정리하는 방식을 함께 씁니다.'],
        rel: ['테스트 데이터 정리', '@DataJpaTest'] },
      { t: '테스트 데이터 정리', deep: false,
        d: '롤백에 기대지 않고 각 테스트가 끝날 때 DB 데이터를 직접 지워 테스트를 서로 독립시키는 방법이다.',
        how: [
          '`@AfterEach`에서 리포지토리 `deleteAllInBatch()`를 호출하거나, 모든 테이블을 TRUNCATE하는 유틸을 만든다.',
          'RANDOM_PORT 테스트, `@Async`, `REQUIRES_NEW`처럼 테스트 트랜잭션으로 롤백되지 않는 데이터가 있을 때 필요하다.',
          '`@Sql` 애너테이션으로 테스트 전후에 SQL 스크립트를 실행할 수도 있다.'
        ],
        rel: ['테스트의 @Transactional', 'RANDOM_PORT 테스트'] },
      { t: 'Testcontainers', deep: true,
        d: '테스트 중에 Docker 컨테이너로 실제 DB, Redis, Kafka 등을 띄워 운영과 같은 환경에서 검증하는 라이브러리다.',
        why: 'H2 같은 내장 DB는 운영 DB와 SQL 문법, 락, 인덱스 동작이 달라 테스트가 운영을 대변하지 못한다. 운영과 같은 버전의 DB를 테스트마다 손쉽게 띄워 이 차이를 없애기 위해서다.',
        how: [
          '1) 테스트가 시작되면 Testcontainers가 Docker에 연결해 지정한 이미지(예: `mysql:8.4`)로 컨테이너를 띄운다.',
          '2) 포트가 열리거나 준비 로그가 나올 때까지 대기 전략에 따라 기다린다.',
          '3) `@ServiceConnection`이 컨테이너의 임의 포트와 접속 정보를 스프링 데이터소스 설정에 넣는다.',
          '4) 테스트가 끝나면 Ryuk 컨테이너가 남은 컨테이너를 정리한다.',
          'H2는 MySQL·PostgreSQL과 SQL 문법, 락, 함수 동작이 달라 테스트는 통과해도 운영에서 실패할 수 있다. Testcontainers는 이 차이를 없앤다.',
          '부트 3.1+에서는 `@ServiceConnection`을 붙이면 컨테이너 접속 정보가 자동으로 데이터소스 설정에 연결된다.',
          '컨테이너를 static으로 선언해 여러 테스트에서 재사용하면 기동 시간을 줄일 수 있다.'
        ],
        qa: ['테스트에 H2 대신 Testcontainers를 쓰는 이유는 무엇인가요?', 'H2는 MySQL 모드를 켜도 문법, 함수, 락, 격리 수준 동작이 실제 MySQL과 다릅니다. 그래서 H2에서 통과한 쿼리가 운영에서 실패하는 일이 생깁니다. Testcontainers는 운영과 같은 버전의 DB를 Docker로 띄워 이 차이를 없애고, 컨테이너를 static으로 재사용해 속도 문제도 줄입니다.'],
        code: `@SpringBootTest
@Testcontainers
class OrderRepositoryIT {
    @Container
    @ServiceConnection
    static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.4");
}`,
        warn: ['테스트 실행 환경(CI 포함)에 Docker가 있어야 한다.'],
        rel: ['@DataJpaTest'] }
    ]}
  ],
  must: [
    '단위 테스트는 많이, 통합 테스트는 적게 두는 테스트 피라미드를 따른다.',
    '로직 검증은 Spring 없이 순수 JUnit + Mockito 단위 테스트가 가장 빠르다.',
    'H2와 운영 DB의 동작 차이가 문제라면 Testcontainers로 실제 DB를 띄운다.',
    '`@DirtiesContext`는 컨텍스트를 다시 만들어 테스트가 크게 느려진다. 꼭 필요할 때만 쓴다.'
  ]
};
