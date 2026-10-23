(window.MINDMAP = window.MINDMAP || {})['spring-7'] = {
  name: 'Spring Security',
  groups: [
    { name: '필터 체인 구조', items: [
      { t: 'DelegatingFilterProxy', deep: true,
        d: '서블릿 컨테이너에 등록되는 표준 필터로, 들어온 요청을 스프링 컨테이너 안의 보안 필터 빈에게 넘겨주는 다리 역할을 한다.',
        why: '서블릿 필터는 톰캣이 관리하는 객체라 스프링 빈이 아니고, 스프링 컨테이너보다 먼저 만들어진다. 그래서 DI와 AOP를 쓰는 스프링 빈을 필터로 바로 쓸 수 없는데, DelegatingFilterProxy가 이 간극을 메운다.',
        how: [
          '1) 서블릿 컨테이너가 기동할 때 DelegatingFilterProxy를 일반 필터로 등록한다. 이 시점에는 대상 빈 이름(`springSecurityFilterChain`)만 알고 있다.',
          '2) 첫 요청이 들어오면 ApplicationContext에서 그 이름의 빈(FilterChainProxy)을 찾아 둔다(지연 조회).',
          '3) 이후 모든 요청에서 `doFilter()`를 그 빈에게 그대로 위임한다.',
          '덕분에 실제 보안 로직은 스프링 빈으로 작성되어 의존성 주입, 설정, 테스트를 모두 스프링 방식으로 할 수 있다.',
          '스프링 부트에서는 SecurityFilterAutoConfiguration이 `DelegatingFilterProxyRegistrationBean`으로 자동 등록하므로 직접 등록할 일은 거의 없다.',
          '필터 순서상 대부분의 다른 서블릿 필터보다 앞쪽에서 실행되어, DispatcherServlet에 닿기 전에 인증과 인가를 끝낸다.'
        ],
        code: `// 부트가 자동으로 해 주는 등록을 직접 쓰면 이런 모습이다
@Bean
public DelegatingFilterProxyRegistrationBean securityFilterChainRegistration() {
    var registration =
        new DelegatingFilterProxyRegistrationBean("springSecurityFilterChain");
    registration.setOrder(SecurityProperties.DEFAULT_FILTER_ORDER);
    return registration;
}`,
        warn: [
          'DelegatingFilterProxy 자체에는 보안 로직이 없다. 보안 동작을 바꾸려면 SecurityFilterChain 설정을 고친다.',
          '커스텀 필터를 `@Component`로 등록하면 부트가 서블릿 필터로도 자동 등록해 보안 체인 안팎에서 두 번 실행될 수 있다. 보안 필터는 `http.addFilterBefore()`로만 넣고 `FilterRegistrationBean.setEnabled(false)`로 자동 등록을 끈다.'
        ],
        qa: ['DelegatingFilterProxy는 왜 필요한가요?', '서블릿 필터는 서블릿 컨테이너가 관리해서 스프링 빈의 기능을 쓸 수 없습니다. DelegatingFilterProxy는 서블릿 컨테이너에 등록되는 일반 필터지만, 요청이 오면 스프링 컨테이너에서 springSecurityFilterChain 빈을 찾아 처리를 위임합니다. 그래서 실제 보안 로직을 스프링 빈으로 작성하고 DI와 설정을 그대로 활용할 수 있습니다.'],
        rel: ['FilterChainProxy', 'SecurityFilterChain'] },
      { t: 'FilterChainProxy', deep: true,
        d: '`springSecurityFilterChain`이라는 이름의 스프링 빈으로, 요청 URL에 맞는 SecurityFilterChain을 골라 그 안의 보안 필터들을 순서대로 실행한다.',
        why: 'API, 관리자 페이지, 정적 리소스처럼 경로마다 다른 보안 정책이 필요하다. FilterChainProxy가 여러 체인 중 하나를 골라 실행하는 진입점 역할을 해 정책을 경로별로 나눌 수 있다.',
        how: [
          '1) DelegatingFilterProxy로부터 요청을 받는다.',
          '2) 등록된 SecurityFilterChain 목록을 순서대로 보며 `matches(request)`가 true인 첫 번째 체인을 고른다.',
          '3) 고른 체인의 필터들을 VirtualFilterChain으로 순서대로 실행한다.',
          '4) 보안 필터가 모두 통과하면 원래 서블릿 필터 체인으로 돌아가 DispatcherServlet까지 진행한다.',
          '- 공통 처리: 요청마다 HttpFirewall(StrictHttpFirewall)로 `..`, 이중 인코딩 같은 위험한 URL을 거부하고, 요청이 끝나면 SecurityContext를 비운다.',
          '- 디버깅: `@EnableWebSecurity(debug = true)`나 `logging.level.org.springframework.security=TRACE`로 어떤 체인과 필터가 실행됐는지 볼 수 있다.'
        ],
        code: `# application.yml - 어떤 필터가 실행되는지 로그로 확인
logging:
  level:
    org.springframework.security: TRACE
# 출력 예: Securing GET /api/orders
#          Invoking SecurityContextHolderFilter (1/12) ...`,
        warn: [
          '첫 번째로 매칭되는 체인 하나만 실행된다. `/**` 같은 넓은 체인이 앞에 있으면 뒤의 체인은 영원히 쓰이지 않으므로 좁은 경로의 체인에 `@Order`로 높은 우선순위를 준다.'
        ],
        qa: ['FilterChainProxy는 어떤 역할을 하나요?', 'DelegatingFilterProxy가 위임하는 실제 스프링 시큐리티의 진입점 빈입니다. 요청 경로에 맞는 SecurityFilterChain을 골라 그 안의 인증·인가 필터를 순서대로 실행합니다. 경로별로 다른 체인을 둘 수 있어 API는 JWT, 관리자 페이지는 폼 로그인처럼 정책을 나눌 수 있고, 요청이 끝나면 SecurityContext 정리도 담당합니다.'],
        rel: ['DelegatingFilterProxy', 'SecurityFilterChain', 'SecurityContextHolder'] },
      { t: 'SecurityFilterChain', deep: true,
        d: '특정 요청 경로에 적용할 보안 필터 목록을 정의한 객체로, 스프링 시큐리티 설정의 실제 단위다.',
        why: 'Security 6(부트 3)부터 `WebSecurityConfigurerAdapter` 상속 방식이 제거되었다. 이제 보안 설정은 SecurityFilterChain 빈을 등록하는 방식으로만 한다.',
        how: [
          '`HttpSecurity`를 받아 인증 방식, 인가 규칙, CSRF, CORS, 세션 정책을 설정한 뒤 `build()`로 SecurityFilterChain을 만든다.',
          '대표 필터 실행 순서:',
          '- 1) SecurityContextHolderFilter: 저장소에서 SecurityContext를 불러온다.',
          '- 2) CorsFilter, CsrfFilter: CORS 프리플라이트 처리와 CSRF 토큰 검증.',
          '- 3) LogoutFilter: 로그아웃 요청 처리.',
          '- 4) UsernamePasswordAuthenticationFilter 또는 커스텀 JWT 필터: 인증 수행.',
          '- 5) ExceptionTranslationFilter: 뒤에서 난 인증 예외를 401, 인가 예외를 403 응답으로 바꾼다.',
          '- 6) AuthorizationFilter: 최종적으로 접근 권한을 판단한다.',
          '`securityMatcher("/api/**")`로 체인이 담당할 경로를 정하고, 여러 빈을 `@Order`로 정렬해 경로별 정책을 나눈다.'
        ],
        code: `@Bean
SecurityFilterChain apiChain(HttpSecurity http, JwtFilter jwtFilter) throws Exception {
    return http
        .securityMatcher("/api/**")
        .csrf(csrf -> csrf.disable())
        .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/auth/**").permitAll()
            .requestMatchers("/api/admin/**").hasRole("ADMIN")
            .anyRequest().authenticated())
        .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
        .build();
}`,
        warn: [
          '`authorizeHttpRequests`의 규칙은 위에서부터 첫 매칭이 적용된다. `anyRequest()`는 반드시 마지막에 둔다.',
          '커스텀 필터 위치를 잘못 잡으면(예: ExceptionTranslationFilter 뒤) 예외가 401/403으로 변환되지 않는다.'
        ],
        qa: ['스프링 시큐리티 필터 체인 구조를 설명해 주세요.', '서블릿 컨테이너에 등록된 DelegatingFilterProxy가 요청을 스프링 빈인 FilterChainProxy에 위임하고, FilterChainProxy가 경로에 맞는 SecurityFilterChain을 골라 실행합니다. 체인 안에서는 컨텍스트 로드, CSRF, 인증 필터, 예외 변환, 인가 필터가 정해진 순서로 동작합니다. Security 6부터는 WebSecurityConfigurerAdapter 대신 HttpSecurity로 SecurityFilterChain 빈을 등록해 설정합니다.'],
        rel: ['FilterChainProxy', 'AuthenticationEntryPoint', 'AccessDeniedHandler', 'JWT'] }
    ]},
    { name: '인증 · 인가', items: [
      { t: '인증 (Authentication)', deep: false,
        d: '"당신은 누구인가"를 확인하는 과정으로, 아이디·비밀번호, 토큰, 인증서 등으로 사용자 신원을 검증한다.',
        how: [
          '스프링 시큐리티에서 인증 결과는 `Authentication` 객체로 표현된다.',
          '- principal: 사용자 정보(보통 UserDetails)',
          '- credentials: 비밀번호 등 자격 증명. 인증 후에는 지운다.',
          '- authorities: 부여된 권한 목록(ROLE_USER 등)',
          '- authenticated: 인증 완료 여부',
          '인증이 성공하면 Authentication이 SecurityContext에 저장되고, 실패하면 401 Unauthorized로 응답한다.'
        ],
        rel: ['인가 (Authorization)', 'AuthenticationManager', 'SecurityContextHolder'] },
      { t: '인가 (Authorization)', deep: false,
        d: '"이 작업을 할 권한이 있는가"를 확인하는 과정으로, 인증된 사용자의 권한을 보고 요청을 허용하거나 막는다.',
        how: [
          '인증이 먼저, 인가가 나중이다. 인가에 실패하면 403 Forbidden으로 응답한다.',
          'URL 단위 인가는 SecurityFilterChain의 `authorizeHttpRequests`에서, 마지막 필터인 AuthorizationFilter가 AuthorizationManager에게 판단을 맡긴다.',
          '- `hasRole("ADMIN")`: 내부적으로 `ROLE_` 접두사를 붙여 `ROLE_ADMIN` 권한을 찾는다.',
          '- `hasAuthority("order:write")`: 문자열을 그대로 비교한다. 세밀한 권한에 쓴다.',
          '- `permitAll()`, `authenticated()`, `denyAll()`'
        ],
        code: `.authorizeHttpRequests(auth -> auth
    .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
    .requestMatchers("/api/admin/**").hasRole("ADMIN")
    .anyRequest().authenticated())`,
        rel: ['인증 (Authentication)', '메서드 보안', 'AccessDeniedHandler'] },
      { t: '메서드 보안', deep: false,
        d: '서비스 메서드에 애너테이션을 붙여 메서드 호출 단위로 인가를 검사하는 기능이다.',
        how: [
          '`@EnableMethodSecurity`를 켜고 `@PreAuthorize`, `@PostAuthorize`를 쓴다. AOP 프록시로 동작한다.',
          '- `@PreAuthorize("hasRole(\'ADMIN\')")`: 메서드 실행 전에 검사한다.',
          '- `@PreAuthorize("#userId == authentication.name")`: 파라미터와 로그인 사용자를 비교해 본인 데이터만 허용한다.',
          '- `@PostAuthorize("returnObject.owner == authentication.name")`: 반환값을 보고 검사한다.',
          'URL 규칙만으로 표현하기 어려운 "본인 글만 수정" 같은 도메인 규칙에 유용하다.'
        ],
        code: `@PreAuthorize("hasRole('ADMIN') or #userId == authentication.name")
public UserResponse getUser(String userId) { ... }`,
        warn: ['AOP 프록시 기반이라 같은 클래스 내부 호출에는 적용되지 않는다.'],
        rel: ['인가 (Authorization)'] }
    ]},
    { name: '인증 처리 흐름', items: [
      { t: 'AuthenticationManager', deep: false,
        d: '인증 요청(Authentication)을 받아 인증된 Authentication을 돌려주거나 예외를 던지는 인증 처리의 진입점 인터페이스다.',
        how: [
          '폼 로그인 기준 흐름:',
          '1) UsernamePasswordAuthenticationFilter가 요청에서 아이디·비밀번호를 꺼내 인증 전 `UsernamePasswordAuthenticationToken`을 만든다.',
          '2) AuthenticationManager의 `authenticate()`를 호출한다.',
          '3) 구현체 ProviderManager는 등록된 AuthenticationProvider 중 이 토큰 타입을 지원하는 것에게 처리를 맡긴다.',
          '4) 성공하면 권한이 채워진 Authentication이 반환되어 SecurityContext에 저장되고, 실패하면 `AuthenticationException`이 던져진다.',
          '로그인 API를 직접 만들 때는 AuthenticationManager를 빈으로 받아 `authenticate()`를 호출한다.'
        ],
        code: `@Bean
AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
    return config.getAuthenticationManager();
}`,
        rel: ['AuthenticationProvider', 'UserDetailsService', '인증 (Authentication)'] },
      { t: 'AuthenticationProvider', deep: false,
        d: '실제로 인증을 수행하는 컴포넌트로, 인증 방식(비밀번호, OTP, 외부 토큰)마다 하나씩 둔다.',
        how: [
          '`supports(Class)`로 처리할 수 있는 토큰 타입을 알리고, `authenticate()`에서 검증한다.',
          '가장 흔한 구현체 DaoAuthenticationProvider는 UserDetailsService로 사용자를 조회하고 PasswordEncoder로 비밀번호를 비교한다.',
          'ProviderManager가 여러 Provider를 순서대로 시도하므로, 아이디·비밀번호와 OTP 인증을 함께 지원할 수 있다.'
        ],
        rel: ['AuthenticationManager', 'UserDetailsService', 'PasswordEncoder'] },
      { t: 'UserDetailsService', deep: false,
        d: '사용자 이름으로 사용자 정보(UserDetails)를 불러오는 인터페이스로, 우리 DB와 스프링 시큐리티를 연결하는 지점이다.',
        how: [
          '`loadUserByUsername(String username)` 하나만 구현한다. 사용자가 없으면 `UsernameNotFoundException`을 던진다.',
          'UserDetails에는 사용자 이름, 암호화된 비밀번호, 권한 목록, 계정 잠금·만료 여부가 담긴다.',
          'DaoAuthenticationProvider가 이 메서드를 호출해 받은 비밀번호 해시를 PasswordEncoder로 입력값과 비교한다.'
        ],
        code: `@Service
@RequiredArgsConstructor
public class MemberDetailsService implements UserDetailsService {
    private final MemberRepository memberRepository;

    @Override
    public UserDetails loadUserByUsername(String email) {
        Member m = memberRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException(email));
        return User.withUsername(m.getEmail())
            .password(m.getPasswordHash())
            .roles(m.getRole().name())
            .build();
    }
}`,
        warn: ['아이디가 없을 때와 비밀번호가 틀릴 때 다른 오류 메시지를 주면 가입된 계정을 알아낼 수 있다. 시큐리티는 기본으로 둘 다 BadCredentialsException으로 감춘다.'],
        rel: ['AuthenticationProvider', 'PasswordEncoder'] },
      { t: 'PasswordEncoder', deep: false,
        d: '비밀번호를 단방향 해시로 바꾸고, 입력값이 저장된 해시와 일치하는지 검사하는 인터페이스다.',
        how: [
          '- `encode(raw)`: 가입·비밀번호 변경 때 해시를 만든다.',
          '- `matches(raw, encoded)`: 로그인 때 입력값과 저장된 해시를 비교한다.',
          '`BCryptPasswordEncoder`는 매번 무작위 salt를 만들어 결과 문자열 안에 함께 저장하고, 반복 비용(strength)으로 일부러 느리게 계산해 무차별 대입을 어렵게 한다. 같은 비밀번호도 매번 다른 해시가 나온다.',
          '`PasswordEncoderFactories.createDelegatingPasswordEncoder()`는 `{bcrypt}...`처럼 알고리즘 접두사를 붙여 저장해, 나중에 Argon2 등으로 바꿔도 기존 해시를 그대로 검증할 수 있다.'
        ],
        code: `@Bean
PasswordEncoder passwordEncoder() {
    return PasswordEncoderFactories.createDelegatingPasswordEncoder();
}`,
        warn: ['비밀번호를 복호화 가능한 방식으로 저장하거나 MD5·SHA-1 같은 빠른 해시를 쓰면 안 된다.'],
        rel: ['UserDetailsService', 'AuthenticationProvider'] }
    ]},
    { name: '보안 컨텍스트', items: [
      { t: 'SecurityContextHolder', deep: false,
        d: '현재 요청을 보낸 사용자의 인증 정보(Authentication)를 담은 SecurityContext를 보관하는 저장소다.',
        how: [
          '기본 전략은 ThreadLocal(MODE_THREADLOCAL)이라 한 요청을 처리하는 스레드 안에서는 어디서든 `SecurityContextHolder.getContext().getAuthentication()`으로 꺼낼 수 있다.',
          '- 컨트롤러에서는 `@AuthenticationPrincipal`로 바로 주입받는 것이 깔끔하다.',
          '- 요청이 끝나면 FilterChainProxy가 컨텍스트를 비운다. 톰캣은 스레드를 재사용하므로 비우지 않으면 다음 요청이 이전 사용자 정보로 실행될 수 있다.',
          '- `@Async`로 넘긴 새 스레드에는 전달되지 않는다. `DelegatingSecurityContextAsyncTaskExecutor`로 감싸 전달한다.'
        ],
        code: `@GetMapping("/me")
public MeResponse me(@AuthenticationPrincipal UserDetails user) {
    return new MeResponse(user.getUsername());
}`,
        rel: ['SecurityContext 저장소', '인증 (Authentication)'] },
      { t: 'SecurityContext 저장소', deep: false,
        d: '요청과 요청 사이에 SecurityContext를 저장하고 다시 불러오는 방법을 정하는 인터페이스다.',
        how: [
          '요청 시작 시 SecurityContextHolderFilter가 이 저장소에서 컨텍스트를 불러와 SecurityContextHolder에 넣는다.',
          '- HttpSessionSecurityContextRepository: 세션에 저장한다. 폼 로그인 같은 세션 방식의 기본값이다.',
          '- RequestAttributeSecurityContextRepository: 한 요청 안에서만 유지한다.',
          '- 무상태 JWT 방식: 세션을 쓰지 않으므로 매 요청마다 JWT 필터가 토큰을 검증해 컨텍스트를 새로 만든다.',
          'Security 6부터는 직접 로그인 API를 만들 때 컨텍스트가 자동 저장되지 않으므로, 세션 방식이라면 `securityContextRepository.saveContext()`를 명시적으로 호출해야 한다.'
        ],
        rel: ['SecurityContextHolder', '세션 인증'] }
    ]},
    { name: '세션 · 토큰', items: [
      { t: '세션 인증', deep: false,
        d: '로그인에 성공하면 서버가 세션에 인증 정보를 저장하고, 클라이언트는 세션 ID 쿠키만 들고 다니는 상태 유지 방식이다.',
        how: [
          '1) 로그인 성공 시 서버가 세션을 만들고 SecurityContext를 저장한 뒤 `JSESSIONID` 쿠키를 내려준다.',
          '2) 이후 요청마다 브라우저가 쿠키를 자동으로 보내고, 서버는 세션에서 컨텍스트를 꺼낸다.',
          '- 장점: 로그아웃이나 강제 만료가 즉시 반영되고, 클라이언트에 민감한 정보가 없다.',
          '- 단점: 서버가 상태를 가져 서버가 여러 대면 Spring Session + Redis로 세션을 공유해야 한다. 쿠키 기반이라 CSRF 방어가 필요하다.',
          '로그인 직후 세션 ID를 새로 발급해 세션 고정 공격을 막는다(시큐리티 기본 동작).'
        ],
        rel: ['JWT', 'CSRF 방어', 'SecurityContext 저장소'] },
      { t: 'JWT', deep: true,
        d: '사용자 정보와 만료 시간을 담고 서버가 서명한 토큰으로, 서버가 저장소를 조회하지 않고 서명 검증만으로 사용자를 확인하는 무상태 인증 방식이다.',
        why: '세션 방식은 서버가 여러 대이거나 모바일 앱, MSA처럼 여러 서비스가 같은 사용자를 확인해야 할 때 세션 공유가 부담이 된다. JWT는 토큰 자체에 정보가 있어 어느 서버든 서명만 검증하면 된다.',
        how: [
          '구조는 `헤더.페이로드.서명` 세 부분을 Base64URL로 인코딩해 점으로 이은 문자열이다.',
          '- 헤더: 서명 알고리즘(HS256, RS256)과 토큰 타입',
          '- 페이로드(클레임): `sub`(사용자 식별자), `exp`(만료 시각), `iat`(발급 시각), 권한 같은 정보',
          '- 서명: 헤더와 페이로드를 비밀키(HS256)나 개인키(RS256)로 서명한 값. 내용이 바뀌면 서명 검증이 실패한다.',
          '스프링에서의 흐름:',
          '1) 로그인 API에서 AuthenticationManager로 인증하고 JWT를 발급한다.',
          '2) 클라이언트는 이후 요청에 `Authorization: Bearer <토큰>` 헤더를 붙인다.',
          '3) OncePerRequestFilter로 만든 JWT 필터가 서명과 만료를 검증하고, Authentication을 만들어 SecurityContext에 넣는다.',
          '4) 세션은 `SessionCreationPolicy.STATELESS`로 만들지 않는다. 직접 필터를 만드는 대신 `oauth2ResourceServer().jwt()`로 검증을 맡길 수도 있다.'
        ],
        code: `public class JwtFilter extends OncePerRequestFilter {
    private final JwtProvider jwtProvider;

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res,
                                    FilterChain chain) throws ServletException, IOException {
        String header = req.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            if (jwtProvider.isValid(token)) {          // 서명 + 만료 검증
                Authentication auth = jwtProvider.toAuthentication(token);
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }
        chain.doFilter(req, res);
    }
}`,
        warn: [
          '페이로드는 암호화가 아니라 인코딩이라 누구나 읽을 수 있다. 비밀번호나 개인정보를 넣지 않는다.',
          '발급한 토큰은 만료 전까지 무효화하기 어렵다. Access Token 수명을 짧게(15~30분) 두고 Refresh Token으로 보완한다.',
          'HS256 비밀키는 충분히 길고 무작위여야 하며 코드에 넣지 않는다. 여러 서비스가 검증하면 RS256으로 공개키만 나눠 준다.',
          'localStorage에 저장하면 XSS로 탈취될 수 있다. HttpOnly 쿠키에 저장하면 대신 CSRF 대비가 필요하다.'
        ],
        qa: ['세션 방식과 JWT 방식의 장단점은 무엇인가요?', '세션은 서버가 상태를 저장해 로그아웃이나 강제 만료가 즉시 되지만, 서버가 여러 대면 Redis 같은 저장소로 세션을 공유해야 합니다. JWT는 서명된 토큰에 정보가 있어 서버가 저장소 조회 없이 검증만 하면 되므로 확장이 쉽지만, 발급된 토큰을 만료 전에 무효화하기 어렵고 페이로드가 노출됩니다. 그래서 JWT는 짧은 Access Token과 서버에 저장하는 Refresh Token을 함께 쓰는 방식으로 보완합니다.'],
        rel: ['Refresh Token', '세션 인증', 'SecurityFilterChain'] },
      { t: 'Refresh Token', deep: true,
        d: 'Access Token이 만료되었을 때 사용자가 다시 로그인하지 않고 새 Access Token을 받을 수 있게 해 주는, 수명이 긴 별도의 토큰이다.',
        why: 'Access Token을 오래 쓰게 하면 탈취됐을 때 피해가 커지고, 짧게 하면 사용자가 자주 로그인해야 한다. 수명이 짧은 Access Token과 서버가 통제하는 Refresh Token을 나누면 보안과 편의를 함께 얻는다.',
        how: [
          '1) 로그인 성공 시 Access Token(15~30분)과 Refresh Token(약 2주)을 함께 발급한다.',
          '2) Refresh Token은 서버의 Redis나 DB에 사용자별로 저장한다. 이 점이 무상태인 Access Token과 다르다.',
          '3) API 호출에서 Access Token이 만료되어 401을 받으면, 클라이언트가 `/auth/refresh`로 Refresh Token을 보낸다.',
          '4) 서버는 저장소의 값과 일치하는지, 만료되지 않았는지 확인하고 새 Access Token을 발급한다.',
          '5) Rotation: 재발급할 때 Refresh Token도 새로 바꾸고 이전 것은 폐기한다. 이미 폐기된 토큰이 다시 들어오면 탈취로 보고 해당 사용자의 토큰을 모두 무효화한다.',
          '6) 로그아웃 시 저장소의 Refresh Token을 지우고, 남은 Access Token은 만료 시각까지 블랙리스트에 둔다.'
        ],
        code: `@PostMapping("/auth/refresh")
public TokenResponse refresh(@CookieValue("refresh_token") String refreshToken) {
    String userId = jwtProvider.getSubject(refreshToken);
    String saved = redis.opsForValue().get("refresh:" + userId);
    if (saved == null || !saved.equals(refreshToken)) {
        redis.delete("refresh:" + userId);          // 재사용 감지 시 전부 무효화
        throw new InvalidTokenException();
    }
    TokenPair pair = jwtProvider.issue(userId);       // Access + 새 Refresh
    redis.opsForValue().set("refresh:" + userId, pair.refresh(), Duration.ofDays(14));
    return TokenResponse.of(pair);
}`,
        warn: [
          'Refresh Token은 탈취되면 피해가 크므로 HttpOnly, Secure, SameSite 쿠키에 저장하고 재발급 경로에만 보내도록 Path를 제한한다.',
          'Rotation 없이 같은 Refresh Token을 계속 쓰면 탈취 여부를 알 수 없다.',
          '여러 기기 로그인을 지원하려면 사용자별 하나가 아니라 기기(세션)별로 저장한다.'
        ],
        qa: ['Refresh Token은 왜 필요하고 어떻게 관리하나요?', 'Access Token은 무상태라 탈취되면 만료 전까지 막기 어려워 수명을 짧게 둡니다. 대신 수명이 긴 Refresh Token을 서버 저장소에 함께 보관해, Access Token이 만료되면 이것으로 재발급합니다. 재발급할 때마다 Refresh Token도 교체하는 Rotation을 적용해 재사용을 탐지하고, 로그아웃 시 저장소에서 삭제해 즉시 무효화합니다.'],
        rel: ['JWT', '세션 인증'] }
    ]},
    { name: 'CSRF · CORS', items: [
      { t: 'CSRF 방어', deep: false,
        d: '로그인한 사용자의 브라우저가 공격자 사이트에서 우리 서버로 원치 않는 요청을 보내게 하는 CSRF 공격을, 예측할 수 없는 토큰으로 막는 기능이다.',
        how: [
          '공격이 가능한 이유는 브라우저가 쿠키를 자동으로 붙여 보내기 때문이다. 그래서 쿠키 기반 세션 인증에서 특히 중요하다.',
          '스프링 시큐리티는 CSRF 보호가 기본으로 켜져 있다. POST·PUT·PATCH·DELETE 요청에 서버가 발급한 CSRF 토큰이 없거나 틀리면 403을 반환한다.',
          '- 서버 렌더링 폼: Thymeleaf가 hidden 필드로 토큰을 자동 삽입한다.',
          '- SPA: `CookieCsrfTokenRepository.withHttpOnlyFalse()`로 토큰을 쿠키에 내려주고, 프론트가 `X-XSRF-TOKEN` 헤더로 돌려보낸다.',
          '쿠키 대신 `Authorization` 헤더로 JWT를 보내는 무상태 API는 브라우저가 토큰을 자동으로 붙이지 않아 CSRF 위험이 없으므로 `csrf.disable()`을 하는 경우가 많다.'
        ],
        warn: ['JWT를 쿠키에 저장하는 구조라면 무상태 API여도 CSRF를 끄면 안 된다.'],
        rel: ['CORS 설정', '세션 인증', 'JWT'] },
      { t: 'CORS 설정', deep: false,
        d: '다른 출처(도메인, 포트, 프로토콜)의 프론트엔드가 우리 API를 호출할 수 있도록 허용 범위를 응답 헤더로 알려 주는 설정이다.',
        how: [
          'CORS는 공격이 아니라 브라우저 정책이다. `https://shop.com` 프론트가 `https://api.shop.com`을 부르면 출처가 달라 브라우저가 응답을 막고, 서버가 허용 헤더를 보내야 통과된다.',
          '스프링 시큐리티를 쓰면 `http.cors(Customizer.withDefaults())`와 `CorsConfigurationSource` 빈으로 설정한다. 그래야 CorsFilter가 인증보다 먼저 실행된다.',
          'WebMvcConfigurer의 CORS 설정만 하면 프리플라이트(OPTIONS) 요청이 인증 필터에서 401로 막혀 실패할 수 있다.'
        ],
        code: `@Bean
CorsConfigurationSource corsConfigurationSource() {
    var config = new CorsConfiguration();
    config.setAllowedOrigins(List.of("https://shop.com"));
    config.setAllowedMethods(List.of("GET", "POST", "PATCH", "DELETE"));
    config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
    config.setAllowCredentials(true);
    var source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/api/**", config);
    return source;
}`,
        warn: ['`allowCredentials(true)`와 허용 출처 `*`는 함께 쓸 수 없다. 출처를 명시한다.'],
        rel: ['CSRF 방어', 'SecurityFilterChain'] }
    ]},
    { name: '보안 예외 처리', items: [
      { t: 'AuthenticationEntryPoint', deep: false,
        d: '인증되지 않은 사용자가 보호된 자원에 접근했을 때 어떤 응답을 줄지 정하는 인터페이스로, 401 처리 담당이다.',
        how: [
          'ExceptionTranslationFilter가 AuthenticationException이나 익명 사용자의 접근 거부를 잡으면 AuthenticationEntryPoint를 호출한다.',
          '폼 로그인은 기본으로 로그인 페이지로 리다이렉트하고, API는 JSON 401 응답을 주도록 직접 구현한다.',
          '필터 단계의 예외라 `@RestControllerAdvice`로는 잡히지 않으므로 여기서 응답 형식을 맞춘다.'
        ],
        code: `.exceptionHandling(e -> e
    .authenticationEntryPoint((req, res, ex) -> {
        res.setStatus(401);
        res.setContentType("application/json");
        res.getWriter().write("{\\"code\\":\\"UNAUTHORIZED\\"}");
    }))`,
        rel: ['AccessDeniedHandler', 'SecurityFilterChain'] },
      { t: 'AccessDeniedHandler', deep: false,
        d: '인증은 되었지만 권한이 없는 사용자가 접근했을 때의 응답을 정하는 인터페이스로, 403 처리 담당이다.',
        how: [
          'AuthorizationFilter나 메서드 보안에서 AccessDeniedException이 나면, ExceptionTranslationFilter가 인증된 사용자라면 AccessDeniedHandler를 호출한다(익명 사용자라면 EntryPoint로 보낸다).',
          'API에서는 공통 에러 형식의 JSON 403을 내려주도록 구현한다.',
          '`@PreAuthorize`에서 난 예외는 컨트롤러 안쪽에서 발생하므로 `@RestControllerAdvice`가 먼저 잡을 수 있다. 전역 Advice에서 AccessDeniedException을 삼키지 않도록 주의한다.'
        ],
        rel: ['AuthenticationEntryPoint', '인가 (Authorization)', '메서드 보안'] }
    ]}
  ],
  must: [
    '비밀번호는 `BCryptPasswordEncoder` 같은 단방향 해시로 저장한다. 복호화가 가능하면 안 된다.',
    'Security 6(Boot 3)부터 `WebSecurityConfigurerAdapter`가 사라졌다. `SecurityFilterChain`을 빈으로 등록한다.',
    'JWT 페이로드는 암호화가 아니라 Base64 인코딩이다. 누구나 읽을 수 있으니 민감한 정보를 넣지 않는다.',
    '필터에서 난 인증·인가 실패는 `AuthenticationEntryPoint`(401)와 `AccessDeniedHandler`(403)로 응답한다.'
  ]
};
