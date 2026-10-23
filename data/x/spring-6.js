(window.MINDMAP_X = window.MINDMAP_X || {})['spring-6'] = {
  groups: {
    '외부 설정': { cmp: {
      cols: ['기준', '@Value', '@ConfigurationProperties'],
      rows: [
        ['주입 단위', '값 하나', '접두사가 같은 설정 묶음'],
        ['타입 안전성', '문자열 키, 오타를 못 잡음', '객체 필드로 바인딩'],
        ['검증', '직접 처리', '@Validated로 기동 시 검증'],
        ['완화된 바인딩', '제한적', 'api-key, API_KEY 모두 인식'],
        ['적합한 경우', '간단한 값 한두 개', '기능별 설정 묶음']
      ]
    } },
    '자동 설정': { cmp: {
      cols: ['기준', '@SpringBootApplication', '자동 설정 원리', '@Conditional 애너테이션'],
      rows: [
        ['역할', '부트 앱 시작점 표시', '라이브러리 보고 빈 자동 등록', '등록 여부 판단'],
        ['핵심 요소', '`@EnableAutoConfiguration` 포함', '`AutoConfiguration.imports` 파일', '`@ConditionalOnClass` 등'],
        ['동작 시점', '기동 시 설정 처리 시작', '사용자 빈 등록 후 처리', '설정·빈 등록 직전 평가'],
        ['확인·제어', '`exclude` 속성', '`--debug` 조건 평가 리포트', '`@ConditionalOnMissingBean`로 양보']
      ]
    } },
    '스타터 · 의존성': { cmp: {
      cols: ['기준', '스타터', '의존성 버전 관리'],
      rows: [
        ['제공하는 것', '기능별 의존성 묶음', '호환 버전 목록 (BOM)'],
        ['예시', '`spring-boot-starter-web`', '`spring-boot-dependencies`'],
        ['효과', '의존성 하나로 기능 구성', '버전 표기 생략 가능'],
        ['재정의', '개별 의존성 exclude', '버전 프로퍼티로 덮어쓰기']
      ]
    } },
    '내장 서버 · 배포': { cmp: {
      cols: ['기준', '내장 서버', '실행 가능한 JAR'],
      rows: [
        ['정체', '라이브러리로 포함된 톰캣', 'fat jar 패키징'],
        ['해결하는 문제', 'WAS 별도 설치 불필요', '배포물 하나로 실행'],
        ['핵심 요소', '`ServletWebServerFactory`', '`JarLauncher`, `BOOT-INF/lib`'],
        ['설정·생성', '`server.port` 등 프로퍼티', '`bootJar`, `spring-boot:repackage`']
      ]
    } },
    'Actuator · 운영': { cmp: {
      cols: ['기준', 'Actuator', 'health 엔드포인트', 'Micrometer 메트릭'],
      rows: [
        ['역할', '운영 정보 엔드포인트', '앱·의존 시스템 상태', '메트릭 계측 파사드'],
        ['경로', '`/actuator/*`', '`/actuator/health`', '`/actuator/metrics`, `prometheus`'],
        ['쓰는 곳', '운영 모니터링 전반', 'LB 헬스 체크, k8s 프로브', 'Prometheus·Grafana'],
        ['주의점', '웹 노출 기본은 health만', '상세는 `show-details` 설정', '태그 카디널리티 폭증']
      ]
    } }
  },
  items: {
    'Spring vs Spring Boot': {
      why: '스프링 부트가 스프링을 대체하는 것이 아니라 설정과 실행을 자동화하는 도구임을 구분해야 동작 원리를 정확히 설명할 수 있기 때문이다.',
      ans: '스프링 부트는 스프링 프레임워크를 대체하는 것이 아니라 쉽게 쓰게 해 주는 도구입니다. 자동 설정으로 인프라 빈을 알아서 등록하고, 스타터로 호환되는 의존성 묶음을 제공하며, 내장 톰캣으로 JAR 하나만 실행하면 됩니다. 덕분에 설정보다 비즈니스 로직에 집중할 수 있습니다.',
      ana: '스프링이 부품 상자라면, 스프링 부트는 부품을 미리 조립해 두고 필요한 곳만 바꿀 수 있게 한 완성품 키트입니다.',
      use: [
        '새 서비스를 만들 때 Spring Initializr로 starter-web, starter-data-jpa만 고르면 바로 실행 가능한 프로젝트가 생긴다.',
        '레거시 WAR 프로젝트를 부트로 옮기면 서버별 톰캣 설치와 설정 관리가 사라진다.'
      ],
      myth: [['스프링 부트는 스프링과 다른 별개의 프레임워크다.', '부트는 스프링 위에서 동작하며, DI·AOP·MVC 같은 핵심 기능은 모두 스프링 프레임워크의 것이다.']],
      fq: [['스프링 부트를 쓰면 어떤 단점이 있나요?', '자동 설정이 많은 일을 숨겨서 내부 동작을 모르면 문제가 생겼을 때 원인을 찾기 어렵습니다. 그래서 조건 평가 리포트나 Actuator로 어떤 빈이 왜 등록됐는지 확인하는 습관이 필요합니다.']]
    },
    '@SpringBootApplication': {
      why: '설정, 컴포넌트 스캔, 자동 설정을 각각 선언하는 번거로움 없이 애너테이션 하나로 애플리케이션을 시작하기 위해서다.',
      ans: '@SpringBootApplication은 @SpringBootConfiguration, @ComponentScan, @EnableAutoConfiguration 세 애너테이션을 합친 것입니다. 이 클래스의 패키지부터 하위 패키지를 스캔하고 자동 설정을 켭니다. 그래서 이 클래스는 최상위 패키지에 두어야 합니다.',
      flow: ['main()에서 run() 호출', 'ApplicationContext 생성', '컴포넌트 스캔', '자동 설정 적용', '내장 서버 시작'],
      use: [
        '특정 자동 설정을 끌 때 `exclude = DataSourceAutoConfiguration.class`를 지정한다.',
        '멀티 모듈 프로젝트에서 다른 모듈의 빈을 스캔하려고 `scanBasePackages`를 지정한다.'
      ],
      myth: [['시작 클래스는 아무 패키지에 둬도 된다.', '이 클래스의 패키지가 스캔 기준이라 하위 패키지에 두면 형제 패키지의 빈을 찾지 못한다.']],
      fq: [['시작 클래스에 다른 @Enable 설정을 같이 두면 어떤 문제가 있나요?', '슬라이스 테스트(@WebMvcTest 등)도 시작 클래스를 기준으로 로드하기 때문에 JPA Auditing 같은 설정이 함께 올라와 필요한 빈이 없어 실패할 수 있습니다. 그래서 이런 설정은 별도의 @Configuration 클래스로 분리합니다.']]
    },
    '자동 설정 원리': {
      ans: '@EnableAutoConfiguration이 각 라이브러리의 AutoConfiguration.imports 파일에 나열된 자동 설정 클래스를 읽어 옵니다. 각 클래스는 @ConditionalOnClass, @ConditionalOnMissingBean 같은 조건이 맞을 때만 적용됩니다. 그래서 의존성만 추가하면 인프라 빈이 생기고, 같은 빈을 직접 등록하면 자동 설정이 물러납니다.',
      ana: '호텔 기본 객실 세팅과 같습니다. 손님이 자기 베개를 가져오면(직접 빈 등록) 호텔 베개는 놓지 않습니다.',
      flow: ['@EnableAutoConfiguration', 'imports 파일에서 목록 로드', '조건 애너테이션 평가', '사용자 빈 있으면 건너뜀', '남은 @Bean 등록', '프로퍼티 값 바인딩'],
      use: [
        'starter-data-jpa와 DB URL만으로 DataSource, EntityManagerFactory, 트랜잭션 매니저가 생긴다.',
        'ObjectMapper 빈을 직접 등록해 날짜 형식을 바꾸면 부트 기본 ObjectMapper는 등록되지 않는다.',
        '사내 공통 라이브러리를 자동 설정으로 만들어 의존성 추가만으로 로깅·모니터링이 켜지게 한다.'
      ],
      myth: [
        ['자동 설정은 무조건 모든 빈을 등록한다.', '클래스패스, 기존 빈, 설정값 조건을 통과한 것만 등록된다.'],
        ['자동 설정 빈을 바꾸려면 자동 설정을 꺼야 한다.', '대부분 같은 타입 빈을 직접 등록하거나 프로퍼티만 바꾸면 된다.']
      ],
      fq: [
        ['어떤 자동 설정이 적용됐는지 어떻게 확인하나요?', '`--debug` 옵션으로 실행하면 CONDITIONS EVALUATION REPORT에 적용된 것과 제외된 것이 이유와 함께 나옵니다. Actuator의 /actuator/conditions 엔드포인트로도 볼 수 있습니다.'],
        ['spring.factories와 AutoConfiguration.imports는 무슨 차이가 있나요?', '부트 2.7 이전에는 spring.factories에 자동 설정 목록을 적었고, 2.7부터 AutoConfiguration.imports 파일이 도입되어 부트 3에서는 이것만 씁니다. 역할은 같고 자동 설정 전용 파일로 분리된 것입니다.'],
        ['직접 등록한 빈이 자동 설정보다 우선하는 이유는 무엇인가요?', '자동 설정 클래스는 사용자 설정이 모두 처리된 뒤에 평가되고, 대부분의 빈 메서드에 @ConditionalOnMissingBean이 붙어 있습니다. 그래서 같은 타입 빈이 이미 있으면 자동 설정 빈은 만들어지지 않습니다.']
      ]
    },
    '@Conditional 애너테이션': {
      why: '클래스패스와 설정, 기존 빈 유무에 따라 자동 설정이 켜지고 꺼지게 해, 필요한 빈만 등록하고 사용자 정의 빈을 우선하기 위해서다.',
      ans: '@Conditional 계열 애너테이션은 조건이 맞을 때만 빈이나 설정 클래스를 등록하게 합니다. 부트는 클래스 존재 여부, 빈 존재 여부, 설정값 같은 자주 쓰는 조건을 @ConditionalOnClass, @ConditionalOnMissingBean, @ConditionalOnProperty로 제공합니다. 자동 설정이 상황에 맞게 켜지고 꺼지는 근거가 바로 이것입니다.',
      use: [
        '`@ConditionalOnProperty(name = "feature.coupon.enabled", havingValue = "true")`로 기능 플래그를 켤 때만 쿠폰 빈을 등록한다.',
        '외부 SDK가 클래스패스에 있을 때만 연동 빈을 등록하도록 `@ConditionalOnClass`를 쓴다.'
      ],
      fq: [['@Profile과 @ConditionalOnProperty는 어떻게 다른가요?', '@Profile은 활성 프로필이라는 환경 단위로 빈을 켜고 끄고, @ConditionalOnProperty는 개별 설정값으로 켜고 끕니다. 환경 전체를 나눌 때는 프로필, 기능 하나를 켜고 끌 때는 프로퍼티 조건이 적합합니다.']]
    },
    '스타터': {
      why: '기능 하나를 쓰는 데 필요한 라이브러리를 일일이 찾아 추가하는 수고와 누락을 막기 위해서다.',
      ans: '스타터는 특정 기능에 필요한 라이브러리를 묶어 둔 의존성 묶음입니다. starter-web 하나로 Spring MVC, 내장 톰캣, Jackson이 함께 들어옵니다. 스타터가 라이브러리를 클래스패스에 올리면 자동 설정이 이를 감지해 빈을 등록하므로 둘은 짝으로 동작합니다.',
      ana: '요리 밀키트처럼 한 가지 요리에 필요한 재료를 한 봉지에 담아 둔 것입니다.',
      use: [
        'REST API 서버는 starter-web, starter-validation, starter-data-jpa 조합으로 시작한다.',
        '테스트는 starter-test 하나로 JUnit 5, Mockito, AssertJ를 함께 받는다.'
      ],
      fq: [['스타터 안에는 코드가 들어 있나요?', '대부분 코드는 거의 없고 의존성 정의만 담고 있습니다. 실제 빈 등록은 spring-boot-autoconfigure 모듈의 자동 설정 클래스가 담당합니다.']]
    },
    '의존성 버전 관리': {
      why: '라이브러리마다 버전을 직접 맞추다 생기는 호환성 충돌을 막기 위해서다.',
      ans: '스프링 부트는 spring-boot-dependencies BOM으로 수백 개 라이브러리의 서로 호환되는 버전을 정해 둡니다. 그래서 의존성에 버전을 적지 않아도 부트 버전에 맞는 검증된 조합이 선택됩니다. 특정 라이브러리만 바꿀 때는 BOM이 쓰는 버전 프로퍼티를 덮어씁니다.',
      use: [
        '부트 버전을 올리면 Hibernate, Jackson, 톰캣 버전이 함께 호환되는 조합으로 올라간다.',
        '보안 패치가 급한 라이브러리 하나만 `ext[\'tomcat.version\']`으로 올린다.'
      ],
      myth: [['버전을 직접 적는 것이 더 안전하다.', '직접 적으면 BOM의 검증된 조합이 깨져 런타임 NoSuchMethodError가 날 수 있다.']],
      fq: [['BOM이란 무엇인가요?', 'Bill of Materials의 약자로, 여러 라이브러리의 버전을 한곳에 정의해 둔 의존성 관리 문서입니다. 이를 가져오면 개별 의존성에 버전을 적지 않아도 정의된 버전이 적용됩니다.']]
    },
    '내장 서버': {
      why: '외부 톰캣을 따로 설치하고 WAR를 배포하는 과정 없이 애플리케이션을 바로 실행하기 위해서다.',
      ans: '스프링 부트는 톰캣 같은 서블릿 컨테이너를 라이브러리로 포함해 애플리케이션 안에서 직접 띄웁니다. 예전처럼 서버에 톰캣을 설치하고 WAR를 배포할 필요 없이 JAR 하나만 실행하면 됩니다. 서버 버전도 애플리케이션 의존성으로 함께 관리됩니다.',
      ana: '집에 가구를 들이는 대신, 가구가 붙박이로 설치된 원룸을 통째로 옮기는 것과 같습니다.',
      flow: ['main() 실행', '스프링 컨테이너 생성', '내장 톰캣 생성', 'DispatcherServlet 등록', '포트 열고 요청 대기'],
      use: [
        '`server.port`, `server.tomcat.threads.max`로 포트와 스레드 수를 설정 파일에서 바꾼다.',
        'Docker 이미지에 JDK와 JAR만 넣어 컨테이너로 배포한다.'
      ],
      fq: [['톰캣 대신 다른 서버를 쓰려면 어떻게 하나요?', 'starter-web에서 spring-boot-starter-tomcat을 제외하고 spring-boot-starter-jetty나 undertow를 추가하면 됩니다. 자동 설정이 클래스패스를 보고 해당 서버를 띄웁니다.']]
    },
    '실행 가능한 JAR': {
      why: '서버 환경에 별도 설치 없이 `java -jar` 하나로 실행해 배포와 컨테이너 이미지 구성을 단순하게 만들기 위해서다.',
      ans: '실행 가능한 JAR는 내 코드, 의존 라이브러리, 내장 서버를 하나로 묶어 java -jar로 바로 실행되는 파일입니다. 라이브러리 JAR들을 BOOT-INF/lib에 그대로 넣고, 부트 전용 런처가 이를 읽어 main을 실행합니다. 배포가 파일 하나로 끝나 컨테이너 환경에 잘 맞습니다.',
      flow: ['bootJar로 빌드', 'java -jar 실행', 'JarLauncher 시작', 'BOOT-INF/lib 로드', '내 main() 호출'],
      use: [
        'CI에서 bootJar 결과물 하나만 서버나 이미지로 배포한다.',
        '레이어드 JAR로 Docker 이미지를 만들어 라이브러리 레이어를 캐시하고 빌드 시간을 줄인다.'
      ],
      fq: [['일반 자바는 JAR 안의 JAR를 못 읽는데 어떻게 실행되나요?', '매니페스트의 Main-Class가 내 클래스가 아니라 부트의 JarLauncher로 지정됩니다. 런처가 중첩된 JAR를 읽을 수 있는 클래스 로더를 만든 뒤 Start-Class에 적힌 내 main을 호출합니다.']]
    },
    '외부 설정 우선순위': {
      why: '같은 설정 키가 여러 곳에 있을 때 어떤 값이 적용되는지 알아야, 환경별로 값을 안전하게 덮어쓸 수 있기 때문이다.',
      ans: '스프링 부트는 커맨드라인 인자, 시스템 속성, 환경 변수, 설정 파일 등 여러 곳의 설정을 하나의 Environment로 합치고 우선순위가 높은 값으로 덮어씁니다. 커맨드라인이 가장 높고 JAR 안의 application.yml이 가장 낮습니다. 그래서 같은 JAR를 환경마다 설정만 바꿔 실행할 수 있습니다.',
      ana: '기본 레시피(JAR 안 yml) 위에 지점별 메모(환경 변수), 그날 주방장 지시(커맨드라인)가 차례로 덧붙는 것과 같습니다.',
      use: [
        '운영 DB 비밀번호는 yml에 두지 않고 `DB_PASSWORD` 환경 변수로 주입한다.',
        '장애 대응 중 `--logging.level.com.shop=DEBUG`로 재시작해 로그 레벨만 올린다.'
      ],
      myth: [['환경 변수 이름은 설정 키와 똑같이 써야 한다.', '완화된 바인딩 덕분에 `spring.datasource.url`은 `SPRING_DATASOURCE_URL`로 쓰면 된다.']],
      fq: [['비밀값은 어디에 두어야 하나요?', '저장소에 커밋되는 yml에는 두지 않고 환경 변수, 쿠버네티스 Secret, AWS Secrets Manager 같은 외부 저장소로 주입합니다. yml에는 `${DB_PASSWORD}`처럼 참조만 둡니다.']]
    },
    '프로필': {
      why: '개발, 테스트, 운영 환경마다 다른 DB 주소나 빈 구성을 코드 수정 없이 실행 시점에 바꾸기 위해서다.',
      ans: '프로필은 개발, 테스트, 운영처럼 환경별 설정과 빈을 묶어 두고 실행할 때 고르는 기능입니다. spring.profiles.active=prod로 켜면 application-prod.yml이 추가로 로드되어 같은 키를 덮어씁니다. @Profile을 붙이면 특정 환경에서만 빈을 등록할 수도 있습니다.',
      use: [
        '로컬에서는 `@Profile("local")`로 가짜 결제 클라이언트를, 운영에서는 실제 클라이언트를 쓴다.',
        '테스트는 `@ActiveProfiles("test")`로 테스트용 DB 설정을 쓴다.'
      ],
      fq: [['프로필이 여러 개 활성화되면 어떻게 되나요?', '`spring.profiles.active=prod,metrics`처럼 여러 개를 켤 수 있고, 같은 키가 겹치면 나중에 적은 프로필의 값이 이깁니다. 프로필 그룹으로 여러 프로필을 한 이름으로 묶을 수도 있습니다.']]
    },
    '@Value': {
      why: '설정값을 코드에 하드코딩하지 않고 외부 설정에서 간단히 하나씩 주입받기 위해서다.',
      ans: '@Value는 설정값 하나를 필드나 생성자 파라미터에 주입하는 애너테이션입니다. ${app.timeout:3000}처럼 기본값을 줄 수 있습니다. 간단하지만 키 오타를 컴파일 시점에 잡지 못해, 설정이 여러 개라면 @ConfigurationProperties가 낫습니다.',
      use: [
        '외부 API 기본 URL 하나를 `@Value("${api.base-url}")`로 받는다.',
        '배치 크기처럼 값 하나만 필요한 곳에 기본값과 함께 쓴다.'
      ],
      fq: [['@Value로 주입한 값이 null이에요. 왜 그런가요?', '빈이 아닌 객체(new로 만든 객체)이거나 static 필드에 붙였기 때문인 경우가 많습니다. @Value는 스프링이 관리하는 빈의 인스턴스 필드나 생성자 파라미터에만 주입됩니다.']]
    },
    '@ConfigurationProperties': {
      why: '관련 설정이 많을 때 `@Value`를 흩어 쓰는 대신 객체로 묶어 타입 검증과 재사용을 쉽게 하기 위해서다.',
      ans: '@ConfigurationProperties는 같은 접두사를 가진 설정 묶음을 객체에 타입 안전하게 바인딩합니다. Duration, 리스트 같은 타입 변환이 자동으로 되고 @Validated로 기동 시점에 잘못된 설정을 잡을 수 있습니다. 그래서 실무에서는 설정이 두세 개만 넘어도 이 방식을 권장합니다.',
      ana: '흩어진 쪽지(@Value)를 하나씩 읽는 대신, 칸이 정해진 서류 양식에 한 번에 받아 적는 것과 같습니다.',
      use: [
        '결제 API의 키, 타임아웃, 재시도 횟수를 `PaymentProperties` record 하나로 받는다.',
        '`@NotBlank`로 필수 키를 검증해 설정 누락 시 배포 직후가 아니라 기동 시점에 실패시킨다.'
      ],
      fq: [['record로 만들면 어떤 장점이 있나요?', '생성자 바인딩으로 값이 채워져 불변 객체가 되고, setter 없이도 바인딩됩니다. 실행 중 설정이 바뀌는 실수를 막고 테스트에서 직접 생성하기도 쉽습니다.']]
    },
    'Actuator': {
      why: '운영 중인 애플리케이션의 상태와 메트릭을 직접 구현하지 않고 표준 엔드포인트로 확인하기 위해서다.',
      ans: 'Actuator는 애플리케이션의 상태, 메트릭, 설정 같은 운영 정보를 /actuator 엔드포인트로 제공하는 모듈입니다. 헬스 체크, 메트릭 수집, 실행 중 로그 레벨 변경에 씁니다. 기본으로는 health만 노출되고, 민감한 엔드포인트는 내부 포트나 인증으로 보호해야 합니다.',
      ana: '자동차 계기판처럼, 엔진을 열어 보지 않아도 속도와 연료 상태를 바로 보여 줍니다.',
      use: [
        '로드 밸런서와 쿠버네티스 프로브가 `/actuator/health`로 서버 상태를 확인한다.',
        '장애 분석 중 `/actuator/loggers`로 재시작 없이 특정 패키지 로그를 DEBUG로 올린다.',
        '`management.server.port=9090`으로 관리용 포트를 분리해 외부에 노출하지 않는다.'
      ],
      myth: [['Actuator를 추가하면 모든 엔드포인트가 열린다.', '웹으로는 기본적으로 health만 노출되고, 나머지는 exposure 설정으로 직접 열어야 한다.']],
      fq: [['Actuator를 운영에서 쓸 때 보안상 주의할 점은?', 'env, heapdump, configprops는 비밀번호나 메모리 내용이 노출될 수 있어 외부에 열면 안 됩니다. 관리 포트를 분리하거나 시큐리티로 인증을 걸고, 꼭 필요한 엔드포인트만 노출합니다.']]
    },
    'health 엔드포인트': {
      why: '로드밸런서나 쿠버네티스가 비정상 인스턴스를 감지해 트래픽을 빼거나 재시작할 수 있게 하기 위해서다.',
      ans: 'health 엔드포인트는 애플리케이션과 DB, Redis 같은 의존 시스템의 상태를 UP이나 DOWN으로 알려 줍니다. 하나라도 DOWN이면 전체가 DOWN이 되고 503을 반환합니다. 쿠버네티스에서는 liveness와 readiness를 나눠 재시작과 트래픽 제외를 따로 판단합니다.',
      flow: ['요청 수신', '각 HealthIndicator 실행', '상태 집계', 'UP이면 200, DOWN이면 503'],
      use: [
        '쿠버네티스 readiness 프로브로 DB 연결이 준비된 파드에만 트래픽을 보낸다.',
        '외부 결제사 연결 상태를 커스텀 HealthIndicator로 추가해 대시보드에 표시한다.'
      ],
      myth: [['DB 상태를 liveness에 넣어야 안전하다.', 'DB 장애 때 모든 파드가 재시작되는 연쇄 장애가 생기므로 외부 의존성은 readiness에만 넣는다.']],
      fq: [['liveness와 readiness는 어떻게 다른가요?', 'liveness는 프로세스가 살아 있는지를 보고 실패하면 컨테이너를 재시작합니다. readiness는 요청을 받을 준비가 됐는지를 보고 실패하면 재시작 없이 트래픽에서만 제외합니다.']]
    },
    'Micrometer 메트릭': {
      why: 'Prometheus, Datadog처럼 모니터링 시스템이 바뀌어도 계측 코드를 다시 짜지 않기 위해서다.',
      ans: 'Micrometer는 여러 모니터링 시스템에 같은 코드로 메트릭을 보낼 수 있게 해 주는 계측 파사드입니다. 부트가 JVM, HTTP 요청, 커넥션 풀 메트릭을 자동으로 수집하고, Counter, Gauge, Timer로 비즈니스 메트릭도 추가할 수 있습니다. 보통 Prometheus가 수집하고 Grafana로 시각화합니다.',
      ana: '로깅의 SLF4J처럼, 계측 코드는 그대로 두고 보내는 곳만 갈아 끼우는 어댑터입니다.',
      use: [
        '`http.server.requests` 메트릭으로 API별 p99 응답 시간을 Grafana에 그린다.',
        '주문 생성 수를 Counter로 기록해 배포 직후 주문이 줄었는지 알림을 건다.',
        'HikariCP 대기 커넥션 수를 보고 커넥션 풀 크기를 조정한다.'
      ],
      fq: [['메트릭 태그를 설계할 때 주의할 점은?', '사용자 id나 주문 번호처럼 값의 종류가 무한한 데이터를 태그로 쓰면 시계열 수가 폭증해 저장소와 조회가 느려집니다. 태그는 HTTP 메서드, 상태 코드, API 경로 템플릿처럼 값의 종류가 제한된 것만 씁니다.']]
    }
  }
};
