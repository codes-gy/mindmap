(window.MINDMAP_X = window.MINDMAP_X || {})['spring-7'] = {
  groups: {
    '필터 체인 구조': { cmp: {
      cols: ['기준', 'DelegatingFilterProxy', 'FilterChainProxy', 'SecurityFilterChain'],
      rows: [
        ['정체', '서블릿 표준 필터', '스프링 빈(진입점)', '경로별 필터 목록'],
        ['관리 주체', '서블릿 컨테이너', '스프링 컨테이너', '스프링 컨테이너'],
        ['역할', '요청을 스프링 빈에 위임', '맞는 체인 선택·실행', '인증·인가 규칙 정의'],
        ['개발자 작업', '거의 없음(자동 등록)', '거의 없음', 'HttpSecurity로 직접 설정']
      ]
    } },
    '인증 · 인가': { cmp: {
      cols: ['기준', '인증 (Authentication)', '인가 (Authorization)'],
      rows: [
        ['질문', '당신은 누구인가', '이 작업을 해도 되는가'],
        ['순서', '먼저', '인증 다음'],
        ['실패 응답', '401 Unauthorized', '403 Forbidden'],
        ['담당 필터', '인증 필터(로그인, JWT)', 'AuthorizationFilter']
      ]
    } },
    '세션 · 토큰': { cmp: {
      cols: ['기준', '세션 인증', 'JWT'],
      rows: [
        ['상태 저장', '서버(세션 저장소)', '토큰 자체(무상태)'],
        ['서버 확장', '세션 공유 필요(Redis)', '서명 검증만으로 가능'],
        ['즉시 무효화', '쉬움(세션 삭제)', '어려움(블랙리스트 필요)'],
        ['CSRF 대비', '필요(쿠키 자동 전송)', '헤더 전송이면 불필요'],
        ['주 사용처', '서버 렌더링 웹', '모바일 앱, SPA, MSA']
      ]
    } },
    'CSRF · CORS': { cmp: {
      cols: ['기준', 'CSRF 방어', 'CORS 설정'],
      rows: [
        ['성격', '공격에 대한 방어', '브라우저 정책 예외 허용'],
        ['막는 대상', '위조된 상태 변경 요청', '허용 안 된 출처의 응답 읽기'],
        ['수단', 'CSRF 토큰, SameSite 쿠키', 'Access-Control-Allow-* 헤더'],
        ['끌 수 있는 경우', '헤더로 토큰 보내는 API', '같은 출처만 쓰는 경우']
      ]
    } },
    '보안 예외 처리': { cmp: {
      cols: ['기준', 'AuthenticationEntryPoint', 'AccessDeniedHandler'],
      rows: [
        ['상황', '인증 안 된 사용자', '인증됐지만 권한 없음'],
        ['상태 코드', '401', '403'],
        ['원인 예외', 'AuthenticationException', 'AccessDeniedException'],
        ['기본 동작', '로그인 페이지로 이동', '403 에러 페이지']
      ]
    } },
    '인증 처리 흐름': { cmp: {
      cols: ['개념', '역할', '대표 구현', '호출 관계'],
      rows: [
        ['AuthenticationManager', '인증 진입점', '`ProviderManager`', '인증 필터가 호출'],
        ['AuthenticationProvider', '실제 인증 수행', '`DaoAuthenticationProvider`', 'Manager가 위임'],
        ['UserDetailsService', '사용자 정보 조회', '직접 구현 (DB 조회)', 'Provider가 호출'],
        ['PasswordEncoder', '비밀번호 해시·비교', '`DelegatingPasswordEncoder` (bcrypt)', 'Provider가 `matches` 호출']
      ]
    } },
    '보안 컨텍스트': { cmp: {
      cols: ['기준', 'SecurityContextHolder', 'SecurityContext 저장소'],
      rows: [
        ['역할', '요청 처리 중 인증 정보 보관', '요청 간 인증 정보 저장·복원'],
        ['범위', '스레드 (기본 ThreadLocal)', '세션 등 요청 사이'],
        ['기본 구현', '`MODE_THREADLOCAL` 전략', '세션 + 요청 속성 위임 저장소'],
        ['JWT 방식', '요청마다 필터가 채움', '`NullSecurityContextRepository`'],
        ['직접 로그인 시', '`setContext`로 설정', '명시적 `saveContext` 필요 (6.x)']
      ]
    } }
  },
  items: {
    'DelegatingFilterProxy': {
      ans: 'DelegatingFilterProxy는 서블릿 컨테이너에 등록되는 일반 필터지만, 요청이 오면 스프링 컨테이너의 springSecurityFilterChain 빈에 처리를 위임합니다. 서블릿 필터는 스프링 빈이 아니라 DI를 쓸 수 없기 때문에 이 다리가 필요합니다. 덕분에 보안 로직을 스프링 빈으로 작성할 수 있습니다.',
      ana: '건물 입구의 안내 데스크처럼, 직접 일을 처리하지 않고 안쪽 보안팀(스프링 빈)으로 방문객을 넘겨줍니다.',
      flow: ['서블릿 컨테이너가 필터 등록', '첫 요청 시 빈 이름으로 조회', 'FilterChainProxy 찾기', 'doFilter() 위임'],
      use: [
        '스프링 부트가 SecurityFilterAutoConfiguration으로 자동 등록하므로 직접 등록할 일은 거의 없다.',
        '커스텀 보안 필터를 `@Component`로 만들면 서블릿 필터로도 이중 등록되므로 `FilterRegistrationBean.setEnabled(false)`로 끈다.'
      ],
      myth: [['DelegatingFilterProxy가 인증을 처리한다.', '보안 로직은 전혀 없고 위임만 한다. 실제 처리는 FilterChainProxy와 SecurityFilterChain의 필터들이 한다.']],
      fq: [
        ['대상 빈을 기동 시점이 아니라 첫 요청 때 찾는 이유는 무엇인가요?', '서블릿 컨테이너가 필터를 초기화하는 시점에는 스프링 ApplicationContext가 아직 준비되지 않았을 수 있습니다. 그래서 빈 이름만 기억해 두고 실제 요청이 올 때 지연 조회합니다.'],
        ['스프링 시큐리티 필터는 일반 서블릿 필터보다 먼저 실행되나요?', 'DelegatingFilterProxy는 기본 순서가 앞쪽(SecurityProperties.DEFAULT_FILTER_ORDER)이라 대부분의 서블릿 필터보다 먼저 실행됩니다. 그래서 DispatcherServlet에 닿기 전에 인증과 인가가 끝납니다.']
      ]
    },
    'FilterChainProxy': {
      ans: 'FilterChainProxy는 스프링 시큐리티의 실제 진입점 빈으로, 요청 경로에 맞는 SecurityFilterChain을 골라 그 안의 필터를 순서대로 실행합니다. 경로별로 체인을 나눌 수 있어 API는 JWT, 관리자 페이지는 폼 로그인처럼 정책을 분리할 수 있습니다. 요청이 끝나면 SecurityContext를 비우는 일도 맡습니다.',
      ana: '공항 보안 검색대의 안내원처럼, 승객(요청)의 목적지를 보고 국내선·국제선 검색 줄 중 하나로 보냅니다.',
      flow: ['위임받은 요청 수신', 'HttpFirewall 검사', '매칭되는 첫 체인 선택', '체인의 필터 순서대로 실행', '원래 필터 체인으로 복귀', 'SecurityContext 정리'],
      use: [
        '`logging.level.org.springframework.security=TRACE`로 어떤 체인과 필터가 실행됐는지 확인하며 디버깅한다.',
        '`/api/**`와 `/admin/**`에 각각 다른 SecurityFilterChain을 두고 `@Order`로 우선순위를 정한다.'
      ],
      myth: [['요청 하나에 매칭되는 체인이 모두 실행된다.', '첫 번째로 매칭되는 체인 하나만 실행된다.']],
      fq: [
        ['체인을 여러 개 둘 때 순서는 왜 중요한가요?', 'FilterChainProxy는 첫 번째로 매칭된 체인만 실행하므로, `/**`처럼 넓은 체인이 앞에 있으면 뒤의 좁은 체인은 쓰이지 않습니다. 그래서 좁은 경로의 체인에 @Order로 높은 우선순위를 줍니다.'],
        ['HttpFirewall은 어떤 역할을 하나요?', '요청 URL에 `..`, 이중 인코딩, 허용되지 않은 문자가 있으면 보안 필터에 들어가기 전에 거부합니다. 경로 조작으로 인가 규칙을 우회하는 공격을 막기 위한 장치입니다.']
      ]
    },
    'SecurityFilterChain': {
      ans: 'SecurityFilterChain은 특정 경로에 적용할 보안 필터 목록이자 스프링 시큐리티 설정의 실제 단위입니다. Security 6부터는 WebSecurityConfigurerAdapter 대신 HttpSecurity로 이 빈을 등록해 인증 방식, 인가 규칙, CSRF, 세션 정책을 설정합니다. 체인 안에서는 컨텍스트 로드, CSRF, 인증, 예외 변환, 인가 필터가 정해진 순서로 동작합니다.',
      flow: ['SecurityContext 로드', 'CORS·CSRF 검사', '로그아웃 처리', '인증 필터(로그인·JWT)', '예외 변환(401/403)', '인가 판단'],
      use: [
        'REST API 체인에 STATELESS 세션, CSRF 비활성화, JWT 필터를 설정한다.',
        '`addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)`로 커스텀 인증 필터 위치를 지정한다.',
        '`securityMatcher("/actuator/**")` 체인을 따로 두어 관리 엔드포인트만 별도 인증을 건다.'
      ],
      myth: [['authorizeHttpRequests 규칙은 순서와 상관없다.', '위에서부터 첫 매칭 규칙이 적용되므로 anyRequest()는 반드시 마지막에 둔다.']],
      fq: [
        ['WebSecurityConfigurerAdapter가 왜 제거되었나요?', '상속 방식은 설정 클래스가 하나로 묶이고 컴포넌트 기반 설정과 어울리지 않았습니다. Security 5.7부터 SecurityFilterChain 빈을 등록하는 방식이 권장되었고, 6에서 어댑터가 완전히 제거되었습니다.'],
        ['커스텀 필터를 ExceptionTranslationFilter 뒤에 두면 어떤 문제가 생기나요?', 'ExceptionTranslationFilter는 자기보다 뒤에서 발생한 인증·인가 예외만 잡아 401/403으로 바꿉니다. 인증 필터가 그 뒤에 있으면 앞쪽에서 처리돼야 할 인증이 늦어지고, 예외 변환 흐름도 기대와 달라집니다.'],
        ['URL마다 다른 인증 방식을 쓰려면 어떻게 하나요?', 'securityMatcher로 경로를 나눈 SecurityFilterChain 빈을 여러 개 등록하고 @Order로 순서를 정합니다. FilterChainProxy가 요청 경로에 맞는 체인을 골라 실행합니다.']
      ]
    },
    '인증 (Authentication)': {
      why: '요청을 보낸 사람이 누구인지 확인하지 않으면 남의 계정으로 위장한 요청을 구분할 수 없기 때문이다.',
      ans: '인증은 사용자가 누구인지 확인하는 과정입니다. 스프링 시큐리티에서는 결과를 principal, credentials, authorities를 담은 Authentication 객체로 표현하고 SecurityContext에 저장합니다. 인증에 실패하면 401로 응답합니다.',
      ana: '건물에 들어갈 때 신분증을 확인하는 단계입니다.',
      use: [
        '아이디·비밀번호 로그인, JWT 검증, OAuth2 소셜 로그인 모두 결국 Authentication 객체를 만든다.',
        '인증 성공 후 credentials(비밀번호)는 메모리에서 지워 노출을 막는다.'
      ],
      fq: [['익명 사용자도 Authentication을 가지나요?', '네, 로그인하지 않은 요청에는 AnonymousAuthenticationFilter가 AnonymousAuthenticationToken을 넣습니다. 그래서 인가 단계에서 익명 사용자와 인증 사용자를 구분해 각각 401과 403으로 처리할 수 있습니다.']]
    },
    '인가 (Authorization)': {
      why: '로그인만 했다고 모든 기능을 쓸 수 있으면 일반 사용자가 관리자 기능이나 남의 데이터에 접근하게 되기 때문이다.',
      ans: '인가는 인증된 사용자가 요청한 작업을 할 권한이 있는지 확인하는 과정입니다. URL 단위는 authorizeHttpRequests 규칙으로, 메서드 단위는 @PreAuthorize로 검사합니다. 권한이 없으면 403으로 응답합니다.',
      ana: '신분증 확인 후, 출입증 등급에 따라 들어갈 수 있는 층이 정해지는 단계입니다.',
      use: [
        '`/api/admin/**`는 `hasRole("ADMIN")`, 상품 조회 GET은 `permitAll()`로 연다.',
        '`hasAuthority("order:write")`처럼 세밀한 권한 문자열로 기능별 접근을 나눈다.'
      ],
      myth: [['hasRole("ADMIN")과 hasAuthority("ADMIN")은 같다.', 'hasRole은 `ROLE_` 접두사를 붙여 `ROLE_ADMIN`을 찾고, hasAuthority는 문자열을 그대로 비교한다.']],
      fq: [['Role과 Authority는 어떻게 구분해 쓰나요?', 'Role은 관리자, 일반 사용자 같은 큰 역할 단위이고, Authority는 order:read처럼 개별 권한 단위입니다. 역할이 단순하면 Role만 쓰고, 세밀한 제어가 필요하면 Authority를 씁니다.']]
    },
    '메서드 보안': {
      why: 'URL 규칙만으로는 표현하기 어려운 권한 검사를 비즈니스 메서드 단위로 빠짐없이 적용하기 위해서다.',
      ans: '메서드 보안은 @EnableMethodSecurity를 켜고 서비스 메서드에 @PreAuthorize 같은 애너테이션을 붙여 호출 단위로 인가를 검사하는 기능입니다. SpEL로 파라미터와 로그인 사용자를 비교할 수 있어 "본인 데이터만 수정" 같은 규칙을 표현하기 좋습니다. AOP 프록시로 동작하므로 내부 호출에는 적용되지 않습니다.',
      use: [
        '`@PreAuthorize("#userId == authentication.name")`로 본인 정보만 조회하게 한다.',
        '관리자 전용 서비스 메서드에 `@PreAuthorize("hasRole(\'ADMIN\')")`를 붙여 URL 규칙 누락에 대비한다.'
      ],
      fq: [['URL 인가와 메서드 보안은 어떻게 나눠 쓰나요?', 'URL 인가는 경로 단위의 넓은 규칙에, 메서드 보안은 도메인 데이터를 보고 판단해야 하는 세밀한 규칙에 씁니다. 둘을 함께 두면 URL 설정을 빠뜨려도 서비스 계층에서 한 번 더 막을 수 있습니다.']]
    },
    'AuthenticationManager': {
      why: '폼 로그인, 토큰, OTP 등 인증 방식이 달라도 필터가 하나의 진입점으로 인증을 요청하게 하기 위해서다.',
      ans: 'AuthenticationManager는 인증 요청을 받아 인증된 Authentication을 돌려주거나 예외를 던지는 인증 처리의 진입점입니다. 구현체 ProviderManager가 등록된 AuthenticationProvider 중 해당 토큰을 지원하는 것에 일을 맡깁니다. 로그인 API를 직접 만들 때는 이 빈을 받아 authenticate()를 호출합니다.',
      ana: '민원 접수 창구처럼, 직접 심사하지 않고 서류 종류에 맞는 담당 부서(Provider)로 넘깁니다.',
      flow: ['필터가 인증 전 토큰 생성', 'authenticate() 호출', '맞는 Provider 선택', 'Provider가 검증', '인증된 객체 반환 또는 예외'],
      use: [
        'JSON 로그인 API에서 `authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, pw))`를 호출한다.',
        '`AuthenticationConfiguration.getAuthenticationManager()`로 부트가 구성한 매니저를 빈으로 꺼내 쓴다.'
      ],
      fq: [['ProviderManager에 맞는 Provider가 없으면 어떻게 되나요?', '부모 AuthenticationManager가 있으면 거기에 다시 위임하고, 끝까지 처리할 Provider가 없으면 ProviderNotFoundException이 발생합니다. 결국 인증 실패로 처리됩니다.']]
    },
    'AuthenticationProvider': {
      why: '인증 방식마다 검증 로직을 분리해, 새 인증 수단을 추가할 때 기존 흐름을 건드리지 않기 위해서다.',
      ans: 'AuthenticationProvider는 실제로 인증을 수행하는 컴포넌트로, supports()로 처리할 토큰 타입을 알리고 authenticate()에서 검증합니다. 가장 흔한 DaoAuthenticationProvider는 UserDetailsService로 사용자를 찾고 PasswordEncoder로 비밀번호를 비교합니다. 인증 방식마다 Provider를 따로 두어 여러 방식을 함께 지원할 수 있습니다.',
      use: [
        '사내 SSO나 OTP 인증을 위해 커스텀 Provider를 만들어 등록한다.',
        '아이디·비밀번호 Provider와 API 키 Provider를 함께 두어 사용자와 서버 간 호출을 모두 처리한다.'
      ],
      fq: [['UserDetailsService만 구현하면 되는데 Provider를 직접 만들 때는 언제인가요?', '사용자 조회와 비밀번호 비교라는 기본 흐름으로 표현할 수 없는 인증일 때입니다. 예를 들어 외부 인증 서버에 토큰을 검증 요청하거나 OTP를 함께 확인해야 하면 Provider를 직접 구현합니다.']]
    },
    'UserDetailsService': {
      why: '사용자 정보가 어느 DB나 저장소에 있든 스프링 시큐리티가 같은 방식으로 불러와 인증에 쓰게 하기 위해서다.',
      ans: 'UserDetailsService는 사용자 이름으로 UserDetails를 불러오는 인터페이스로, 우리 DB와 스프링 시큐리티를 연결하는 지점입니다. loadUserByUsername 하나만 구현하고, 사용자가 없으면 UsernameNotFoundException을 던집니다. 비밀번호 비교는 여기서 하지 않고 Provider와 PasswordEncoder가 합니다.',
      use: [
        '회원 테이블을 이메일로 조회해 비밀번호 해시와 권한을 UserDetails로 바꿔 반환한다.',
        '계정 잠금·휴면 여부를 UserDetails의 `isAccountNonLocked()` 등에 반영해 로그인을 막는다.'
      ],
      myth: [['loadUserByUsername에서 비밀번호까지 검사해야 한다.', '사용자 조회만 하고, 비밀번호 비교는 DaoAuthenticationProvider가 PasswordEncoder로 한다.']],
      fq: [['아이디가 없을 때와 비밀번호가 틀릴 때 메시지를 다르게 주면 왜 안 되나요?', '공격자가 어떤 아이디가 가입되어 있는지 알아낼 수 있기 때문입니다. 스프링 시큐리티는 기본으로 두 경우를 모두 BadCredentialsException으로 처리해 같은 메시지를 줍니다.']]
    },
    'PasswordEncoder': {
      why: '비밀번호를 평문으로 저장하면 DB가 유출되는 순간 모든 계정이 그대로 털리기 때문이다.',
      ans: 'PasswordEncoder는 비밀번호를 단방향 해시로 바꾸고 입력값이 저장된 해시와 맞는지 검사하는 인터페이스입니다. BCryptPasswordEncoder는 매번 무작위 salt를 만들고 일부러 느리게 계산해 무차별 대입을 어렵게 합니다. DelegatingPasswordEncoder를 쓰면 알고리즘 접두사가 붙어 나중에 알고리즘을 바꾸기도 쉽습니다.',
      ana: '고기를 갈아 다짐육을 만드는 것처럼, 같은 재료면 같은 결과를 확인할 수는 있지만 원래 고기로 되돌릴 수는 없습니다.',
      use: [
        '회원 가입 시 `passwordEncoder.encode(raw)`로 해시를 만들어 저장한다.',
        '기존 SHA 해시를 쓰던 시스템을 DelegatingPasswordEncoder로 옮겨, 로그인할 때마다 bcrypt로 점진 전환한다.'
      ],
      myth: [['같은 비밀번호는 항상 같은 해시가 나와야 비교할 수 있다.', 'bcrypt는 salt를 결과 안에 함께 저장해, 해시가 매번 달라도 `matches()`로 비교할 수 있다.']],
      fq: [['bcrypt의 strength 값을 높이면 어떻게 되나요?', '해시 계산 반복 횟수가 2의 거듭제곱으로 늘어 공격자가 대입하기 더 어려워집니다. 대신 로그인마다 서버 CPU를 더 쓰므로 보통 한 번 계산에 수백 밀리초 이하가 되도록 조정합니다.']]
    },
    'SecurityContextHolder': {
      why: '인증 정보를 파라미터로 계층마다 넘기지 않고도 요청 처리 중 어디서든 현재 사용자를 꺼내 쓰기 위해서다.',
      ans: 'SecurityContextHolder는 현재 사용자의 Authentication을 담은 SecurityContext를 보관하는 저장소입니다. 기본 전략이 ThreadLocal이라 같은 요청 스레드 안에서는 어디서든 꺼낼 수 있습니다. 요청이 끝나면 비워야 스레드 재사용 시 다른 사용자 정보가 섞이지 않습니다.',
      ana: '요청을 처리하는 직원(스레드) 목에 거는 출입증과 같아서, 그 직원이 어느 부서에 가든 누구의 일인지 알 수 있습니다.',
      use: [
        '컨트롤러에서 `@AuthenticationPrincipal`로 로그인 사용자를 바로 주입받는다.',
        'JPA Auditing의 AuditorAware에서 SecurityContextHolder로 작성자 id를 꺼내 createdBy에 넣는다.'
      ],
      myth: [['@Async 메서드에서도 로그인 사용자를 그대로 꺼낼 수 있다.', 'ThreadLocal이라 새 스레드로 전달되지 않는다. DelegatingSecurityContextAsyncTaskExecutor로 감싸야 한다.']],
      fq: [['MODE_INHERITABLETHREADLOCAL은 왜 스레드 풀과 함께 쓰면 위험한가요?', '자식 스레드가 생성될 때 부모의 컨텍스트를 복사하는데, 스레드 풀은 스레드를 재사용하므로 처음 생성될 때 복사된 다른 사용자의 정보가 남아 있을 수 있습니다. 그래서 작업 단위로 컨텍스트를 전달하는 Delegating 계열 Executor를 씁니다.']]
    },
    'SecurityContext 저장소': {
      why: 'HTTP는 무상태라서 로그인 상태를 어딘가에 저장하지 않으면 다음 요청마다 다시 인증해야 하기 때문이다.',
      ans: 'SecurityContextRepository는 요청 사이에 SecurityContext를 저장하고 불러오는 방법을 정합니다. 세션 방식은 HttpSessionSecurityContextRepository가 세션에 저장하고, 요청 시작 시 SecurityContextHolderFilter가 이를 불러옵니다. JWT 같은 무상태 방식은 저장하지 않고 매 요청 토큰으로 새로 만듭니다.',
      flow: ['요청 시작', '저장소에서 컨텍스트 로드', 'Holder에 설정', '요청 처리', '필요 시 저장소에 저장'],
      use: [
        '직접 만든 로그인 API에서 세션 방식을 유지하려고 `securityContextRepository.saveContext(context, req, res)`를 호출한다.',
        '무상태 API는 `SessionCreationPolicy.STATELESS`로 세션 저장을 끈다.'
      ],
      myth: [['Security 6에서도 로그인 후 컨텍스트가 자동으로 세션에 저장된다.', '시큐리티 필터가 처리한 로그인만 자동 저장되고, 직접 만든 로그인 API는 명시적으로 저장해야 한다.']],
      fq: [['Security 6에서 직접 만든 로그인 API로 로그인했는데 다음 요청에서 풀려요. 왜 그런가요?', 'Security 6부터 SecurityContextHolder에 값을 넣는 것만으로는 세션에 자동 저장되지 않습니다. SecurityContextRepository의 saveContext를 직접 호출해야 다음 요청에서 컨텍스트를 불러올 수 있습니다.']]
    },
    '세션 인증': {
      why: '매 요청마다 아이디와 비밀번호를 보내지 않고도 서버가 로그인 상태를 기억하게 하기 위해서다.',
      ans: '세션 인증은 로그인 성공 시 서버가 세션에 인증 정보를 저장하고, 클라이언트는 JSESSIONID 쿠키만 들고 다니는 방식입니다. 서버가 상태를 가지므로 강제 로그아웃이 즉시 되고 클라이언트에 민감한 정보가 없습니다. 대신 서버가 여러 대면 Redis 같은 저장소로 세션을 공유해야 하고, 쿠키 기반이라 CSRF 방어가 필요합니다.',
      ana: '물품 보관소에서 짐(인증 정보)은 맡겨 두고 번호표(세션 ID)만 들고 다니는 것과 같습니다.',
      flow: ['로그인 성공', '서버가 세션 생성·저장', 'JSESSIONID 쿠키 발급', '요청마다 쿠키 자동 전송', '세션에서 컨텍스트 조회'],
      use: [
        'Spring Session + Redis로 여러 서버가 같은 세션을 공유하게 한다.',
        '관리자 화면처럼 강제 로그아웃이 중요한 서비스에 세션 방식을 쓴다.'
      ],
      fq: [['세션 고정 공격이란 무엇이고 어떻게 막나요?', '공격자가 미리 알고 있는 세션 ID를 피해자가 쓰게 만든 뒤, 피해자가 로그인하면 그 세션을 가로채는 공격입니다. 로그인 직후 세션 ID를 새로 발급하면 막을 수 있고, 스프링 시큐리티가 기본으로 그렇게 합니다.']]
    },
    'JWT': {
      ans: 'JWT는 사용자 정보와 만료 시간을 담고 서버가 서명한 토큰입니다. 서버는 저장소를 조회하지 않고 서명만 검증하면 되어 무상태로 확장하기 쉽고, 여러 서비스가 같은 토큰을 검증할 수 있습니다. 다만 발급한 토큰을 만료 전에 무효화하기 어렵고 페이로드가 노출되므로, 짧은 Access Token과 Refresh Token을 함께 씁니다.',
      ana: '위조 방지 홀로그램이 붙은 놀이공원 손목 밴드처럼, 직원이 명단을 찾아보지 않아도 밴드만 보고 입장을 허락합니다.',
      flow: ['로그인 후 토큰 발급', '요청에 Bearer 헤더 첨부', 'JWT 필터가 서명·만료 검증', 'Authentication 생성', 'SecurityContext에 설정'],
      use: [
        '모바일 앱과 SPA의 API 인증에 Access Token을 `Authorization: Bearer` 헤더로 보낸다.',
        'MSA에서 인증 서버가 RS256으로 서명하고, 각 서비스는 공개키로만 검증한다.',
        '`oauth2ResourceServer().jwt()`로 직접 필터를 만들지 않고 검증을 맡긴다.'
      ],
      myth: [
        ['JWT는 암호화되어 있어 안전하다.', '페이로드는 Base64URL 인코딩일 뿐 누구나 읽을 수 있다. 서명은 위조를 막을 뿐 내용을 숨기지 않는다.'],
        ['JWT를 쓰면 세션보다 무조건 낫다.', '즉시 로그아웃이 어렵고 토큰 크기가 커서, 서버 렌더링 웹에서는 세션이 더 단순하고 안전할 수 있다.']
      ],
      fq: [
        ['JWT로 로그아웃은 어떻게 구현하나요?', '서버가 토큰을 저장하지 않으므로 Refresh Token을 저장소에서 삭제하고, 남은 Access Token은 만료 시각까지 Redis 블랙리스트에 넣어 거부합니다. Access Token 수명을 짧게 두면 블랙리스트 부담도 줄어듭니다.'],
        ['HS256과 RS256은 어떻게 다른가요?', 'HS256은 하나의 비밀키로 서명과 검증을 모두 해서 검증하는 쪽도 비밀키를 가져야 합니다. RS256은 개인키로 서명하고 공개키로 검증하므로, 여러 서비스에 공개키만 나눠 주면 되어 MSA에 적합합니다.'],
        ['토큰은 클라이언트 어디에 저장해야 하나요?', 'localStorage는 XSS로 스크립트가 읽을 수 있어 탈취 위험이 있습니다. HttpOnly, Secure 쿠키에 저장하면 스크립트로 읽을 수 없지만 쿠키가 자동 전송되므로 SameSite 설정이나 CSRF 토큰으로 대비해야 합니다.']
      ]
    },
    'Refresh Token': {
      ans: 'Refresh Token은 Access Token이 만료됐을 때 다시 로그인하지 않고 새 토큰을 받게 해 주는 수명이 긴 토큰입니다. Access Token은 짧게 두어 탈취 피해를 줄이고, Refresh Token은 서버 저장소에 보관해 로그아웃 시 즉시 무효화합니다. 재발급할 때마다 Refresh Token도 바꾸는 Rotation으로 재사용을 탐지합니다.',
      ana: '하루짜리 출입증(Access Token)이 만료되면, 사원증(Refresh Token)을 보여 주고 새 출입증을 받는 것과 같습니다. 사원증은 회사가 명단으로 관리합니다.',
      flow: ['로그인 시 두 토큰 발급', 'Refresh Token 서버 저장', 'Access 만료로 401', '/auth/refresh 요청', '저장값 일치 확인', '새 토큰 쌍 발급·교체'],
      use: [
        'Refresh Token을 Redis에 `refresh:{userId}` 키와 14일 TTL로 저장한다.',
        '기기별로 Refresh Token을 저장해 "다른 기기에서 로그아웃" 기능을 만든다.',
        'Refresh Token 쿠키의 Path를 `/auth/refresh`로 제한해 다른 API 요청에는 실리지 않게 한다.'
      ],
      myth: [['Refresh Token도 JWT처럼 서버에 저장하지 않아도 된다.', '서버가 저장하지 않으면 로그아웃이나 탈취 시 무효화할 방법이 없어 Refresh Token을 두는 의미가 사라진다.']],
      fq: [
        ['Refresh Token Rotation은 왜 필요한가요?', '재발급할 때마다 새 Refresh Token을 주고 이전 것을 폐기하면, 폐기된 토큰이 다시 들어왔을 때 탈취로 판단할 수 있습니다. 이때 해당 사용자의 토큰을 모두 무효화해 피해를 막습니다.'],
        ['Access Token과 Refresh Token의 수명은 어떻게 정하나요?', 'Access Token은 탈취 시 피해 시간을 줄이려고 15~30분 정도로 짧게, Refresh Token은 재로그인 빈도와 보안 요구에 따라 1~2주 정도로 둡니다. 금융처럼 민감한 서비스는 더 짧게 잡습니다.']
      ]
    },
    'CSRF 방어': {
      why: '브라우저가 쿠키를 자동으로 붙이는 점을 악용해 사용자 몰래 송금이나 정보 변경 요청을 보내는 공격을 막기 위해서다.',
      ans: 'CSRF는 로그인한 사용자의 브라우저가 공격자 사이트에서 우리 서버로 원치 않는 요청을 보내게 하는 공격입니다. 브라우저가 쿠키를 자동으로 보내기 때문에 가능하며, 스프링 시큐리티는 상태를 바꾸는 요청에 서버가 발급한 CSRF 토큰을 요구해 막습니다. 헤더로 토큰을 보내는 무상태 API는 위험이 없어 보통 끕니다.',
      ana: '은행 창구에서 서명뿐 아니라 그날 발급한 번호표까지 확인하는 것과 같습니다. 남이 위조한 신청서에는 번호표가 없습니다.',
      use: [
        'Thymeleaf 폼은 hidden 필드로 CSRF 토큰이 자동 삽입된다.',
        'SPA에서는 `CookieCsrfTokenRepository.withHttpOnlyFalse()`로 토큰을 쿠키로 주고 `X-XSRF-TOKEN` 헤더로 돌려받는다.'
      ],
      myth: [['REST API면 무조건 CSRF를 꺼도 된다.', '인증 정보를 쿠키로 보낸다면 REST API여도 CSRF 공격이 가능하므로 켜 두어야 한다.']],
      fq: [['SameSite 쿠키만으로 CSRF를 완전히 막을 수 있나요?', 'Lax나 Strict면 다른 사이트에서 시작된 POST 요청에 쿠키가 실리지 않아 대부분 막을 수 있습니다. 하지만 Lax는 최상위 GET 이동에는 쿠키를 보내고 구형 브라우저 지원도 다르므로, 중요한 요청은 CSRF 토큰과 함께 쓰는 것이 안전합니다.']]
    },
    'CORS 설정': {
      why: '출처가 다른 프론트엔드의 API 호출을 브라우저가 기본적으로 막기 때문에, 허용할 출처를 서버가 명시해야 하기 때문이다.',
      ans: 'CORS는 다른 출처의 프론트엔드가 우리 API 응답을 읽을 수 있도록 서버가 응답 헤더로 허용 범위를 알려 주는 브라우저 정책입니다. 스프링 시큐리티에서는 http.cors()와 CorsConfigurationSource 빈으로 설정해 CorsFilter가 인증보다 먼저 실행되게 합니다. 그렇지 않으면 프리플라이트 요청이 인증 단계에서 막힙니다.',
      ana: '아파트 경비실이 방문객 명단을 보고 출입을 허락하는 것처럼, 서버가 허용한 출처만 응답을 받아 볼 수 있습니다.',
      flow: ['브라우저가 다른 출처 감지', 'OPTIONS 프리플라이트 전송', 'CorsFilter가 허용 헤더 응답', '본 요청 전송', '브라우저가 응답 전달'],
      use: [
        '`https://shop.com` 프론트만 허용하고 Authorization 헤더와 쿠키 전송을 허락한다.',
        '로컬 개발용 `http://localhost:3000`은 local 프로필에서만 허용 출처에 추가한다.'
      ],
      myth: [['CORS 오류는 서버가 요청을 거부한 것이다.', '서버는 정상 처리했을 수도 있고, 허용 헤더가 없어 브라우저가 응답을 막은 것이다.']],
      fq: [['allowCredentials(true)일 때 허용 출처를 *로 하면 왜 안 되나요?', '쿠키 같은 인증 정보를 모든 출처에 허용하면 어떤 사이트든 사용자 권한으로 응답을 읽을 수 있게 됩니다. 그래서 브라우저 표준이 이 조합을 금지하며, 출처를 명시하거나 allowedOriginPatterns로 지정해야 합니다.']]
    },
    'AuthenticationEntryPoint': {
      why: '인증되지 않은 요청에 로그인 페이지 리다이렉트나 JSON 401 등 클라이언트에 맞는 일관된 응답을 주기 위해서다.',
      ans: 'AuthenticationEntryPoint는 인증되지 않은 사용자가 보호된 자원에 접근했을 때의 응답을 정하는 인터페이스로 401 처리를 담당합니다. ExceptionTranslationFilter가 인증 예외를 잡으면 이를 호출합니다. 필터 단계 예외라 @RestControllerAdvice로 잡히지 않으므로 API는 여기서 JSON 에러 형식을 맞춥니다.',
      use: [
        'JWT가 없거나 만료된 요청에 `{"code":"UNAUTHORIZED"}` 형태의 401 JSON을 내려준다.',
        '토큰 만료와 위조를 구분한 에러 코드를 주어 클라이언트가 재발급 여부를 판단하게 한다.'
      ],
      fq: [['JWT 필터에서 던진 예외가 EntryPoint로 가지 않아요. 왜 그런가요?', 'ExceptionTranslationFilter는 자기보다 뒤쪽 필터에서 발생한 예외만 잡습니다. JWT 필터가 그 앞에 있으면 예외가 그대로 서블릿 컨테이너로 올라가므로, 필터 안에서 예외를 처리하거나 인증 실패 시 컨텍스트를 비워 두고 뒤의 인가 단계에서 EntryPoint가 호출되게 합니다.']]
    },
    'AccessDeniedHandler': {
      why: '권한 없는 접근에 기본 에러 페이지 대신 API 규약에 맞는 403 응답을 일관되게 돌려주기 위해서다.',
      ans: 'AccessDeniedHandler는 인증은 됐지만 권한이 없는 사용자가 접근했을 때의 응답을 정하는 인터페이스로 403 처리를 담당합니다. 인가 실패 시 ExceptionTranslationFilter가 인증된 사용자라면 이 핸들러를, 익명 사용자라면 EntryPoint를 호출합니다. API에서는 공통 에러 형식의 403 JSON을 내려주도록 구현합니다.',
      use: [
        '일반 사용자가 관리자 API를 호출하면 `{"code":"FORBIDDEN"}` 403을 반환한다.',
        '권한 부족 시도를 로그로 남겨 비정상 접근을 모니터링한다.'
      ],
      myth: [['@PreAuthorize 실패도 항상 AccessDeniedHandler가 처리한다.', '컨트롤러 안쪽에서 발생하므로 @RestControllerAdvice가 먼저 잡을 수 있다. 전역 Advice에서 삼키지 않도록 주의한다.']],
      fq: [['로그인하지 않은 사용자가 관리자 API를 호출하면 401인가요 403인가요?', '익명 사용자의 접근 거부는 인증이 필요한 상황으로 보고 AuthenticationEntryPoint가 호출되어 401이 나갑니다. 로그인한 일반 사용자가 호출했을 때만 AccessDeniedHandler가 403을 반환합니다.']]
    }
  }
};
