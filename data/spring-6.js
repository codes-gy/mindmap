(window.MINDMAP = window.MINDMAP || {})['spring-6'] = {
  name: 'Spring Boot',
  groups: [
    { name: 'Spring Boot 개요', items: [
      { t: 'Spring vs Spring Boot', deep: false,
        d: '스프링 부트는 스프링 프레임워크를 설정 없이 바로 실행할 수 있게 만든 도구로, 스프링 자체를 대체하지 않는다.',
        how: [
          '스프링 프레임워크는 DI, AOP, MVC, 트랜잭션 같은 핵심 기능을 제공한다. 예전에는 DispatcherServlet, DataSource, 트랜잭션 매니저, 뷰 리졸버를 XML이나 자바 설정으로 직접 등록하고, 라이브러리 버전 호환을 손으로 맞추고, WAR로 빌드해 외부 톰캣에 배포해야 했다.',
          '스프링 부트는 그 반복 작업을 대신한다.',
          '- 자동 설정: 클래스패스와 설정값을 보고 필요한 빈을 알아서 등록한다.',
          '- 스타터: 기능별 의존성 묶음과 검증된 버전 조합을 제공한다.',
          '- 내장 서버: 톰캣을 포함한 실행 가능한 JAR 하나로 배포한다.',
          '- 운영 기능: 외부 설정, Actuator를 기본으로 제공한다.',
          '핵심 철학은 "관례에 따른 설정(Convention over Configuration)"이다. 기본값으로 동작하다가 필요한 부분만 바꾼다.'
        ],
        qa: ['Spring Boot는 무엇을 해결했나요?', '스프링으로 애플리케이션을 만들 때 반복되던 인프라 설정, 의존성 버전 관리, 서버 배포 작업을 없앴습니다. 자동 설정이 클래스패스를 보고 필요한 빈을 등록하고, 스타터가 호환되는 의존성 묶음을 제공하며, 내장 톰캣 덕분에 JAR 하나로 실행할 수 있습니다. 스프링을 대체하는 것이 아니라 스프링을 쉽게 쓰게 해 주는 도구입니다.'],
        rel: ['자동 설정 원리', '스타터', '내장 서버'] }
    ]},
    { name: '자동 설정', items: [
      { t: '@SpringBootApplication', deep: true,
        d: '스프링 부트 애플리케이션의 시작 클래스에 붙이는 애너테이션으로, 세 애너테이션을 하나로 합친 것이다.',
        why: '애플리케이션을 시작하는 데 필요한 설정 클래스 지정, 컴포넌트 스캔, 자동 설정 활성화를 애너테이션 하나로 끝내기 위해서다.',
        how: [
          '1) `SpringApplication.run()`이 클래스패스를 보고 애플리케이션 유형(서블릿, 리액티브, 일반)을 정한다.',
          '2) Environment를 준비해 설정 파일, 환경 변수, 커맨드라인 인자를 읽는다.',
          '3) ApplicationContext를 만들고, 메인 클래스의 패키지부터 컴포넌트 스캔으로 사용자 빈 정의를 등록한다.',
          '4) 사용자 설정을 모두 처리한 뒤 자동 설정 클래스를 조건에 따라 적용한다.',
          '5) 컨텍스트를 refresh해 싱글톤 빈을 만들고 내장 서버를 시작한 뒤 `ApplicationReadyEvent`를 발행한다.',
          '- `@SpringBootConfiguration`: 이 클래스가 설정 클래스임을 표시한다. 내부적으로 `@Configuration`이다.',
          '- `@ComponentScan`: 이 클래스가 있는 패키지와 하위 패키지에서 `@Component` 계열 클래스를 찾아 빈으로 등록한다.',
          '- `@EnableAutoConfiguration`: 자동 설정을 켠다.',
          '`main()`에서 `SpringApplication.run(App.class, args)`를 호출하면 ApplicationContext를 만들고, 컴포넌트 스캔과 자동 설정을 거쳐 내장 서버까지 띄운다.',
          '`exclude` 속성으로 특정 자동 설정을 끌 수 있다. 예: `@SpringBootApplication(exclude = DataSourceAutoConfiguration.class)`.'
        ],
        qa: ['@SpringBootApplication은 어떤 애너테이션으로 이루어져 있나요?', '@SpringBootConfiguration, @ComponentScan, @EnableAutoConfiguration 세 개를 합친 것입니다. 설정 클래스임을 표시하고, 이 클래스의 패키지부터 하위 패키지를 스캔하며, 클래스패스와 조건에 맞는 자동 설정을 켭니다. 스캔 기준이 이 클래스의 패키지라서 최상위 패키지에 두어야 합니다.'],
        code: `@SpringBootApplication
public class ShopApplication {
    public static void main(String[] args) {
        SpringApplication.run(ShopApplication.class, args);
    }
}`,
        warn: [
          '이 클래스가 있는 패키지가 컴포넌트 스캔의 기준이므로 최상위 패키지(com.shop)에 둔다. 하위 패키지에 두면 형제 패키지의 빈을 찾지 못한다.',
          '이 클래스에 `@EnableJpaAuditing` 같은 설정을 함께 붙이면 슬라이스 테스트에서도 로드되어 실패할 수 있다. 별도 `@Configuration`으로 뺀다.'
        ],
        rel: ['자동 설정 원리', '@Conditional 애너테이션'] },
      { t: '자동 설정 원리', deep: true,
        d: '클래스패스에 있는 라이브러리와 설정값을 보고, 조건이 맞는 자동 설정 클래스만 골라 빈을 등록하는 스프링 부트의 핵심 메커니즘이다.',
        why: 'DB를 쓰려면 DataSource, EntityManagerFactory, 트랜잭션 매니저 같은 인프라 빈을 매번 똑같이 등록해야 했다. 자동 설정은 이 반복을 없애면서도, 사용자가 직접 등록한 빈이 있으면 물러나서 커스터마이징을 막지 않는다.',
        how: [
          '1) `@EnableAutoConfiguration`이 `AutoConfigurationImportSelector`를 등록한다.',
          '2) 셀렉터가 각 라이브러리 JAR 안의 `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports` 파일을 읽어 자동 설정 클래스 목록(수백 개)을 모은다. 부트 2.7 이전에는 `spring.factories`였다.',
          '3) 각 자동 설정 클래스에 붙은 조건 애너테이션을 평가한다. 예: `DataSourceAutoConfiguration`은 `@ConditionalOnClass(DataSource.class)`라서 JDBC 관련 클래스가 있을 때만 후보가 된다.',
          '4) 조건을 통과한 클래스의 `@Bean` 메서드가 실행된다. 이때 대부분의 빈 메서드에 `@ConditionalOnMissingBean`이 붙어 있어 사용자가 같은 타입 빈을 이미 등록했다면 건너뛴다.',
          '5) 설정값은 `@ConfigurationProperties` 클래스(예: `DataSourceProperties`의 `spring.datasource.*`)로 바인딩되어 자동 설정에 쓰인다.',
          '그래서 `spring-boot-starter-data-jpa`를 추가하고 `spring.datasource.url`만 적으면 DataSource, EntityManagerFactory, JpaTransactionManager가 자동으로 생긴다.',
          '자동 설정 클래스는 사용자 빈 등록이 끝난 뒤에 처리되므로 사용자 설정이 항상 우선한다.'
        ],
        code: `// 부트 내부 자동 설정 클래스를 단순화한 모습
@AutoConfiguration
@ConditionalOnClass(ObjectMapper.class)
public class JacksonAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean          // 사용자가 직접 만들면 이 빈은 등록되지 않는다
    public ObjectMapper objectMapper(Jackson2ObjectMapperBuilder builder) {
        return builder.build();
    }
}

// 적용 결과 확인: java -jar app.jar --debug
// => CONDITIONS EVALUATION REPORT 에 Positive/Negative matches 출력`,
        warn: [
          '같은 타입 빈을 직접 등록하면 자동 설정이 조용히 물러난다. 의도치 않게 기본 설정(예: Jackson 모듈)이 빠질 수 있다.',
          '어떤 자동 설정이 적용됐는지 모르겠으면 `--debug`로 실행해 조건 평가 리포트를 보거나 Actuator의 `/actuator/conditions`를 확인한다.',
          '직접 자동 설정을 만들 때는 `@AutoConfiguration`을 붙이고 imports 파일에 등록해야 하며, 컴포넌트 스캔 대상 패키지에 두면 안 된다.'
        ],
        qa: ['스프링 부트 자동 설정은 어떤 원리로 동작하나요?', '`@EnableAutoConfiguration`이 각 라이브러리의 AutoConfiguration.imports 파일에 나열된 자동 설정 클래스를 읽어 옵니다. 각 클래스는 `@ConditionalOnClass`, `@ConditionalOnMissingBean` 같은 조건이 맞을 때만 적용되어, 필요한 라이브러리가 있고 사용자가 같은 빈을 등록하지 않았을 때만 빈을 만듭니다. 그래서 의존성만 추가해도 인프라 빈이 생기고, 직접 빈을 등록하면 자동 설정이 물러나 커스터마이징할 수 있습니다.'],
        rel: ['@SpringBootApplication', '@Conditional 애너테이션', '스타터', '@ConfigurationProperties'] },
      { t: '@Conditional 애너테이션', deep: false,
        d: '조건이 맞을 때만 빈이나 설정 클래스를 등록하게 하는 애너테이션 모음으로, 자동 설정이 상황에 맞게 켜지고 꺼지는 근거다.',
        how: [
          '스프링 4의 `@Conditional`(Condition 인터페이스 구현)을 부트가 자주 쓰는 형태로 확장해 제공한다.',
          '- `@ConditionalOnClass` / `@ConditionalOnMissingClass`: 특정 클래스가 클래스패스에 있을 때 / 없을 때',
          '- `@ConditionalOnBean` / `@ConditionalOnMissingBean`: 특정 빈이 있을 때 / 없을 때',
          '- `@ConditionalOnProperty`: 설정값이 있거나 특정 값일 때. 예: `@ConditionalOnProperty(name = "feature.coupon.enabled", havingValue = "true")`',
          '- `@ConditionalOnWebApplication`: 웹 애플리케이션일 때',
          '애플리케이션 코드에서도 기능 플래그로 빈을 켜고 끄거나, 환경에 따라 구현체를 바꿀 때 쓸 수 있다.'
        ],
        warn: ['`@ConditionalOnBean`은 빈 등록 순서에 영향을 받아 일반 설정 클래스에서는 기대와 다르게 동작할 수 있다. 자동 설정 클래스에서 쓰는 것이 안전하다.'],
        rel: ['자동 설정 원리', '프로필'] }
    ]},
    { name: '스타터 · 의존성', items: [
      { t: '스타터', deep: false,
        d: '특정 기능에 필요한 라이브러리를 모아 둔 의존성 묶음으로, 코드 없이 의존성 정의만 담고 있다.',
        how: [
          '`spring-boot-starter-xxx` 하나만 추가하면 그 기능에 필요한 라이브러리가 전이 의존성으로 함께 들어온다.',
          '- `spring-boot-starter-web`: Spring MVC, 내장 톰캣, Jackson',
          '- `spring-boot-starter-data-jpa`: Hibernate, Spring Data JPA, HikariCP, JDBC',
          '- `spring-boot-starter-security`: Spring Security',
          '- `spring-boot-starter-test`: JUnit 5, AssertJ, Mockito, Spring Test',
          '스타터가 라이브러리를 클래스패스에 올리면, 자동 설정이 그 클래스를 감지해 관련 빈을 등록한다. 스타터와 자동 설정은 함께 동작한다.'
        ],
        code: `dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
}`,
        rel: ['의존성 버전 관리', '자동 설정 원리'] },
      { t: '의존성 버전 관리', deep: false,
        d: '스프링 부트가 BOM(spring-boot-dependencies)으로 수백 개 라이브러리의 서로 호환되는 버전을 정해 두는 기능이다.',
        how: [
          '부트 플러그인(또는 `spring-boot-starter-parent`)을 쓰면 의존성에 버전을 적지 않아도 부트 버전에 맞는 버전이 자동으로 선택된다.',
          '부트 팀이 해당 조합으로 테스트했으므로 Jackson, Hibernate, 톰캣 버전 충돌 같은 문제가 줄어든다.',
          '특정 라이브러리 버전만 바꾸고 싶으면 Gradle에서는 `ext[\'jackson.version\'] = \'...\'`처럼 BOM이 쓰는 프로퍼티를 덮어쓴다.'
        ],
        warn: ['의존성에 버전을 직접 적으면 BOM의 검증된 조합을 깨뜨려 런타임에 NoSuchMethodError 같은 오류가 날 수 있다.'],
        rel: ['스타터'] }
    ]},
    { name: '내장 서버 · 배포', items: [
      { t: '내장 서버', deep: false,
        d: '톰캣(기본), Jetty, Undertow 같은 서블릿 컨테이너를 라이브러리로 포함해 애플리케이션 안에서 직접 띄우는 방식이다.',
        how: [
          '`main()`이 실행되면 스프링 컨테이너를 만들면서 내장 톰캣을 생성하고 DispatcherServlet을 등록한 뒤 포트를 연다.',
          '예전 방식(외부 WAS)은 서버마다 톰캣을 설치하고 버전과 설정을 맞춘 뒤 WAR를 배포해야 했다. 내장 서버는 애플리케이션과 서버 버전이 함께 관리된다.',
          '- 포트, 스레드 수 등은 `server.port`, `server.tomcat.threads.max` 같은 설정으로 바꾼다.',
          '- 다른 서버를 쓰려면 starter-web에서 tomcat을 제외하고 `spring-boot-starter-jetty`를 추가한다.'
        ],
        rel: ['실행 가능한 JAR', 'Spring vs Spring Boot'] },
      { t: '실행 가능한 JAR', deep: false,
        d: '애플리케이션 코드와 모든 의존 라이브러리, 내장 서버를 하나로 묶어 `java -jar`로 바로 실행되는 JAR(fat jar)다.',
        how: [
          '`./gradlew bootJar`로 만든다. 의존 라이브러리 JAR들을 풀지 않고 `BOOT-INF/lib`에 그대로 넣고, 내 클래스는 `BOOT-INF/classes`에 둔다.',
          '자바 표준은 JAR 안의 JAR를 읽지 못하므로, 부트 전용 런처(JarLauncher)가 먼저 실행되어 내부 JAR들을 클래스패스로 읽은 뒤 내 `main()`을 호출한다.',
          '배포가 파일 하나로 끝나고 Docker 이미지로 만들기 쉽다. 이미지 빌드 시 레이어드 JAR를 쓰면 자주 바뀌지 않는 라이브러리 레이어를 캐시해 빌드가 빨라진다.'
        ],
        code: `./gradlew bootJar
java -jar build/libs/shop-0.0.1.jar --spring.profiles.active=prod`,
        rel: ['내장 서버', '외부 설정 우선순위'] }
    ]},
    { name: '외부 설정', items: [
      { t: '외부 설정 우선순위', deep: true,
        d: '같은 JAR를 환경마다 설정만 바꿔 실행할 수 있도록 여러 곳의 설정을 하나의 Environment로 합치고, 우선순위가 높은 값으로 덮어쓰는 규칙이다.',
        why: '같은 JAR를 다시 빌드하지 않고 로컬, 개발, 운영 환경마다 다른 설정으로 실행하고, 비밀값을 코드 저장소 밖에서 넣기 위해서다.',
        how: [
          '1) 부트가 기동 초기에 커맨드라인 인자, 시스템 속성, 환경 변수, 설정 파일을 각각 PropertySource로 만든다.',
          '2) 우선순위 순서대로 Environment의 PropertySource 목록에 넣는다.',
          '3) 값을 찾을 때 앞(우선순위가 높은 쪽)부터 조회해 처음 찾은 값을 쓴다. 그래서 높은 쪽이 낮은 쪽을 덮어쓰는 것처럼 동작한다.',
          '주요 우선순위(높은 순):',
          '- 1) 커맨드라인 인자: `--server.port=9000`',
          '- 2) 자바 시스템 속성: `-Dserver.port=9000`',
          '- 3) OS 환경 변수: `SERVER_PORT=9000` (점은 밑줄, 대문자로 바꾸는 완화된 바인딩)',
          '- 4) JAR 밖의 application-{profile}.yml, application.yml',
          '- 5) JAR 안의 application-{profile}.yml, application.yml',
          '코드에 박힌 기본값은 JAR 안 yml에 두고, 환경별로 달라지는 값과 비밀값은 환경 변수나 커맨드라인으로 덮어쓰는 것이 일반적이다.'
        ],
        qa: ['운영 서버에서 포트만 바꿔 실행하려면 어떻게 하나요?', 'JAR를 다시 빌드하지 않고 `java -jar app.jar --server.port=9000`처럼 커맨드라인 인자로 넘기거나 `SERVER_PORT` 환경 변수를 설정합니다. 둘 다 JAR 안의 application.yml보다 우선순위가 높아 그 값을 덮어씁니다.'],
        code: `# application.yml
spring:
  datasource:
    url: \${DB_URL:jdbc:mysql://localhost:3306/shop}
    password: \${DB_PASSWORD}`,
        warn: ['비밀번호와 API 키는 yml에 커밋하지 않는다. 환경 변수나 시크릿 매니저로 주입한다.'],
        rel: ['프로필', '@ConfigurationProperties', '@Value'] },
      { t: '프로필', deep: false,
        d: '개발, 테스트, 운영처럼 환경별로 다른 설정과 빈을 묶어 두고, 실행할 때 활성화할 묶음을 고르는 기능이다.',
        how: [
          '`spring.profiles.active=prod`로 활성화하면 application.yml에 더해 application-prod.yml이 로드되고, 같은 키는 프로필 쪽 값이 이긴다.',
          '하나의 yml 안에서 `---`로 문서를 나누고 `spring.config.activate.on-profile: prod`로 프로필별 구간을 둘 수도 있다.',
          '`@Profile("local")`을 빈이나 설정 클래스에 붙이면 해당 프로필일 때만 등록된다. 예: 로컬에서만 가짜 결제 클라이언트를 쓰기.',
          '테스트에서는 `@ActiveProfiles("test")`로 지정한다.'
        ],
        code: `@Configuration
@Profile("local")
public class LocalPaymentConfig {
    @Bean
    PaymentClient paymentClient() { return new FakePaymentClient(); }
}`,
        rel: ['외부 설정 우선순위', '@Conditional 애너테이션'] },
      { t: '@Value', deep: false,
        d: '설정값 하나를 필드나 생성자 파라미터에 주입하는 애너테이션이다.',
        how: [
          '`@Value("${app.timeout}")`처럼 쓰고, `${app.timeout:3000}`으로 기본값을 줄 수 있다.',
          '간단한 값 하나를 받을 때 편하다. SpEL(`#{...}`)도 쓸 수 있다.',
          '- 동작: 빈을 만들 때 `AutowiredAnnotationBeanPostProcessor`가 `${...}`를 Environment 값으로 치환하고, 필드 타입(int, Duration 등)으로 변환해 넣는다.',
          '- 키가 없고 기본값도 없으면 기동 시 `Could not resolve placeholder` 예외로 실패한다.',
          '- 생성자 파라미터에 붙이면 `final` 필드로 받을 수 있어 테스트에서 값을 넣기 쉽다.'
        ],
        warn: [
          '키에 오타가 있어도 컴파일 시점에는 알 수 없고, 기본값이 없으면 기동 시 오류가 난다.',
          '관련 설정이 여러 개라면 `@ConfigurationProperties`로 묶는 편이 낫다.'
        ],
        rel: ['@ConfigurationProperties'] },
      { t: '@ConfigurationProperties', deep: false,
        d: '`app.*`처럼 접두사가 같은 설정 묶음을 객체에 타입 안전하게 바인딩하는 애너테이션으로, 실무에서 권장되는 방식이다.',
        how: [
          'record나 클래스에 `@ConfigurationProperties(prefix = "app.payment")`를 붙이고 `@EnableConfigurationProperties`나 `@ConfigurationPropertiesScan`으로 등록한다.',
          '- 타입 변환: `Duration`, `DataSize`, 리스트, 맵까지 자동으로 바뀐다(`timeout: 3s`).',
          '- 검증: `@Validated`와 `@NotBlank` 등을 붙이면 기동 시점에 잘못된 설정을 잡는다.',
          '- 완화된 바인딩: `api-key`, `apiKey`, `API_KEY`가 같은 필드로 바인딩된다.',
          '- IDE 자동 완성: configuration-processor를 추가하면 yml 작성 시 자동 완성과 문서가 생긴다.'
        ],
        code: `@Validated
@ConfigurationProperties(prefix = "app.payment")
public record PaymentProperties(
        @NotBlank String apiKey,
        Duration timeout,
        int retryCount) {}`,
        rel: ['@Value', '외부 설정 우선순위', '자동 설정 원리'] }
    ]},
    { name: 'Actuator · 운영', items: [
      { t: 'Actuator', deep: false,
        d: '애플리케이션의 상태, 메트릭, 설정 같은 운영 정보를 HTTP 엔드포인트로 제공하는 스프링 부트 모듈이다.',
        how: [
          '`spring-boot-starter-actuator`를 추가하면 `/actuator/*` 엔드포인트가 생긴다.',
          '- `/actuator/health`: 애플리케이션과 DB, 디스크 등의 상태',
          '- `/actuator/metrics`: JVM, HTTP, 커넥션 풀 메트릭',
          '- `/actuator/loggers`: 실행 중에 로그 레벨 조회·변경',
          '- `/actuator/env`, `/actuator/conditions`, `/actuator/threaddump`, `/actuator/heapdump`',
          '보안상 기본으로는 health만 웹에 노출된다. 더 열려면 `management.endpoints.web.exposure.include`를 설정한다.'
        ],
        warn: [
          'env, heapdump, configprops는 비밀번호 같은 민감 정보를 노출할 수 있다. 외부에 열지 말고 `management.server.port`로 내부 포트를 분리하거나 인증을 건다.'
        ],
        rel: ['health 엔드포인트', 'Micrometer 메트릭'] },
      { t: 'health 엔드포인트', deep: false,
        d: '애플리케이션이 정상인지와 의존 시스템(DB, Redis, 디스크) 연결 상태를 UP/DOWN으로 알려 주는 엔드포인트다.',
        how: [
          '각 HealthIndicator(DataSourceHealthIndicator 등)의 결과를 모아 전체 상태를 정한다. 하나라도 DOWN이면 전체가 DOWN이 되고 HTTP 503을 반환한다.',
          '쿠버네티스 환경에서는 `/actuator/health/liveness`(살아 있는가, 실패 시 재시작)와 `/actuator/health/readiness`(트래픽을 받을 준비가 됐는가, 실패 시 트래픽 제외)를 따로 프로브로 쓴다.',
          '`HealthIndicator`를 구현하면 외부 결제 API 연결 같은 커스텀 상태도 추가할 수 있다.'
        ],
        warn: ['외부 의존성 장애를 liveness에 넣으면 DB 장애 때 모든 파드가 재시작되는 연쇄 장애가 생긴다. 외부 의존성은 readiness에만 반영한다.'],
        rel: ['Actuator'] },
      { t: 'Micrometer 메트릭', deep: false,
        d: '여러 모니터링 시스템에 같은 코드로 메트릭을 보낼 수 있게 해 주는 계측 파사드로, Actuator 메트릭의 기반이다.',
        how: [
          'SLF4J가 로깅 구현을 감추듯, Micrometer는 Prometheus, Datadog, CloudWatch 같은 모니터링 시스템을 감춘다. 레지스트리 의존성만 바꾸면 보내는 곳이 바뀐다.',
          '부트가 JVM 메모리·GC·스레드, HTTP 요청 수와 응답 시간(`http.server.requests`), HikariCP 커넥션 풀 메트릭을 자동으로 수집한다.',
          '- Counter: 증가만 하는 값(주문 수)',
          '- Gauge: 현재 값(큐 길이)',
          '- Timer: 소요 시간과 횟수(외부 API 응답 시간)',
          'Prometheus가 `/actuator/prometheus`를 주기적으로 수집하고 Grafana로 대시보드를 만드는 구성이 흔하다.'
        ],
        code: `@Component
public class OrderMetrics {
    private final Counter orderCounter;

    public OrderMetrics(MeterRegistry registry) {
        this.orderCounter = Counter.builder("orders.created").register(registry);
    }

    public void increment() { orderCounter.increment(); }
}`,
        warn: ['태그에 사용자 id처럼 값의 종류가 무한히 많은 데이터를 넣으면 메트릭 수가 폭증해 모니터링 시스템이 느려진다.'],
        rel: ['Actuator'] }
    ]}
  ],
  must: [
    '같은 타입 빈을 직접 등록하면 `@ConditionalOnMissingBean` 때문에 자동 설정이 물러난다.',
    '`@SpringBootApplication`이 있는 패키지가 컴포넌트 스캔의 기준이다. 최상위 패키지에 둔다.',
    '어떤 자동 설정이 적용됐는지는 `--debug` 실행 시 나오는 조건 평가 리포트로 확인한다.',
    'Boot 3는 Java 17 이상이 필요하고 `javax.*` 패키지가 `jakarta.*`로 바뀌었다.',
    '비밀번호·키 같은 비밀값은 yml에 커밋하지 말고 환경 변수나 시크릿 매니저로 주입한다.'
  ]
};
