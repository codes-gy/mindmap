(window.MINDMAP = window.MINDMAP || {})['spring-2'] = {
  name: 'AOP',
  groups: [
    { name: '횡단 관심사', items: [
      { t: '횡단 관심사', deep: false,
        d: '로깅, 트랜잭션, 보안처럼 여러 클래스에 공통으로 끼어드는 부가 기능이다.',
        how: [
          '애플리케이션 로직은 핵심 관심사(주문, 결제 같은 비즈니스 로직)와 횡단 관심사로 나눌 수 있다. 횡단 관심사는 여러 계층과 클래스에 같은 코드로 반복해서 나타난다.',
          '모든 서비스 메서드에 실행 시간 측정 코드를 넣으면 중복이 생기고, 측정 방식을 바꿀 때 수백 곳을 고쳐야 한다. AOP는 이 부가 기능을 한 모듈로 모으고 "어디에 적용할지"만 선언하게 한다.',
          '- 장점: 중복 제거, 핵심 로직의 가독성 향상, 부가 기능을 바꿀 때 한 곳만 수정',
          '- 스프링의 대표 사례: `@Transactional`, `@Cacheable`, `@Async`, 스프링 시큐리티의 `@PreAuthorize`'
        ],
        qa: ['AOP는 어떤 문제를 해결하나요?', '여러 클래스에 반복되는 로깅, 트랜잭션 같은 횡단 관심사를 핵심 로직에서 분리해 한 곳에 모읍니다. 부가 기능은 Aspect로 작성하고 적용 대상만 포인트컷으로 선언하므로 중복이 사라지고 핵심 로직은 비즈니스에만 집중할 수 있습니다.'],
        rel: ['Aspect', 'Pointcut', '@Around'] }
    ]},
    { name: 'AOP 용어', items: [
      { t: 'Aspect', deep: false,
        d: '부가 기능(Advice)과 적용 대상(Pointcut)을 하나로 묶은 모듈이다.',
        how: [
          '스프링에서는 클래스에 `@Aspect`를 붙이고 스프링 빈으로 등록해(`@Component`) 만든다. 클래스 안의 각 메서드가 Advice가 되고, 메서드에 붙은 포인트컷 표현식이 적용 대상을 정한다.',
          '- 하나의 Aspect 안에 여러 Advice와 Pointcut을 둘 수 있다.',
          '- 스프링 내부에서는 Aspect가 여러 개의 Advisor(Pointcut 1 + Advice 1)로 변환되어 프록시 생성에 쓰인다.',
          '- 여러 Aspect가 같은 대상에 적용되면 `@Order`로 순서를 정한다.'
        ],
        code: `@Aspect
@Component
public class TimeTraceAspect {
    @Around("execution(* com.shop..*Service.*(..))")
    public Object trace(ProceedingJoinPoint pjp) throws Throwable {
        long start = System.currentTimeMillis();
        try {
            return pjp.proceed();
        } finally {
            log.info("{} {}ms", pjp.getSignature(), System.currentTimeMillis() - start);
        }
    }
}`,
        rel: ['Advice', 'Pointcut', 'Advisor'] },
      { t: 'Advice', deep: false,
        d: '실제로 실행될 부가 기능 코드와 그 실행 시점을 말한다.',
        how: [
          'Advice는 "무엇을 할지"와 "언제 할지"를 함께 정의한다. 스프링은 실행 시점에 따라 `@Before`, `@AfterReturning`, `@AfterThrowing`, `@After`, `@Around` 다섯 가지를 제공한다.',
          '- 스프링 AOP의 Advice는 메서드 실행 전후에만 끼어들 수 있다.',
          '- Advice 메서드는 `JoinPoint`(또는 `@Around`의 `ProceedingJoinPoint`)를 파라미터로 받아 대상 메서드 이름, 인자, 대상 객체 정보를 얻을 수 있다.',
          '- 스프링 내부에서는 Advice가 MethodInterceptor로 바뀌어 프록시의 인터셉터 체인에 들어간다.'
        ],
        rel: ['@Around', '@Before', 'Aspect'] },
      { t: 'JoinPoint', deep: false,
        d: 'Advice를 적용할 수 있는 실행 지점이다. 스프링 AOP에서는 메서드 실행만 해당한다.',
        how: [
          '이론적으로 JoinPoint는 메서드 호출, 생성자 호출, 필드 접근, static 초기화 등 프로그램 실행 중의 여러 지점이 될 수 있다. AspectJ는 이 지점들을 모두 지원한다.',
          '스프링 AOP는 프록시를 통해 동작하므로 프록시가 가로챌 수 있는 "스프링 빈의 메서드 실행"만 JoinPoint가 된다.',
          '- Advice 메서드의 파라미터 `JoinPoint`로 현재 지점 정보를 꺼낸다: `getSignature()`(메서드 시그니처), `getArgs()`(인자), `getTarget()`(원본 객체), `getThis()`(프록시 객체).',
          '- `@Around`에서는 실행을 제어할 수 있는 `ProceedingJoinPoint`를 받는다.'
        ],
        rel: ['Pointcut', 'Spring AOP', 'AspectJ'] },
      { t: 'Pointcut', deep: false,
        d: 'JoinPoint 중에서 Advice를 실제로 적용할 곳을 고르는 표현식이다.',
        how: [
          '스프링은 AspectJ의 포인트컷 표현식 문법을 그대로 쓴다.',
          '- `execution(* com.shop.order..*Service.*(..))`: 패키지·클래스·메서드 이름 패턴으로 선택. 가장 많이 쓴다.',
          '- `within(com.shop..*)`: 특정 패키지나 타입 안의 모든 메서드',
          '- `@annotation(com.shop.LogTime)`: 해당 애너테이션이 붙은 메서드',
          '- `@within(...)`, `bean(orderService)`, `args(..)` 등도 있다.',
          '`@Pointcut`으로 이름 붙인 포인트컷을 만들어 여러 Advice에서 재사용하고 `&&`, `||`, `!`로 조합할 수 있다. 애너테이션 기반 포인트컷은 적용 대상이 코드에 드러나 실무에서 선호된다.'
        ],
        code: `@Pointcut("execution(* com.shop..*Service.*(..))")
private void allService() {}

@Before("allService() && @annotation(com.shop.LogTime)")
public void log(JoinPoint jp) {
    log.info("call {}", jp.getSignature());
}`,
        rel: ['JoinPoint', 'Aspect', 'Advisor'] },
      { t: 'Target', deep: false,
        d: 'Advice가 적용되는 원본 객체, 즉 프록시가 감싸고 있는 실제 빈이다.',
        how: [
          '프록시는 요청을 받으면 Advice를 실행한 뒤 Target의 실제 메서드를 호출한다. 컨테이너에는 Target 대신 프록시가 빈으로 등록되므로, 다른 빈이 주입받는 것은 프록시다.',
          '- Advice 안에서 `joinPoint.getTarget()`으로 원본 객체를, `getThis()`로 프록시 객체를 얻을 수 있다.',
          '- Target 내부에서 `this`로 자기 메서드를 부르면 프록시를 거치지 않는다. 이것이 셀프 호출 문제의 원인이다.'
        ],
        rel: ['셀프 호출 문제', 'CGLIB 프록시'] },
      { t: 'Advisor', deep: false,
        d: 'Pointcut 하나와 Advice 하나를 묶은 것으로, 스프링 AOP 내부에서 쓰는 단위다.',
        how: [
          '`@Aspect` 클래스는 개발 편의를 위한 표현이고, 스프링은 이를 읽어 Advisor 목록으로 바꾼다(BeanFactoryAspectJAdvisorsBuilder).',
          '자동 프록시 생성기(AnnotationAwareAspectJAutoProxyCreator)는 빈이 만들어질 때 모든 Advisor의 Pointcut을 그 빈에 대조해 보고, 하나라도 맞으면 프록시를 만들어 맞는 Advisor들을 적용한다.',
          '- 하나의 빈에 여러 Advisor가 맞아도 프록시는 하나만 만들어지고, 그 안에 Advisor들이 체인으로 들어간다.',
          '- `@Transactional`도 내부적으로 BeanFactoryTransactionAttributeSourceAdvisor라는 Advisor로 동작한다.'
        ],
        rel: ['Aspect', 'Pointcut', 'Weaving'] },
      { t: 'Weaving', deep: false,
        d: 'Advice를 Target에 실제로 적용해 부가 기능이 동작하게 만드는 과정이다.',
        how: [
          '위빙 시점은 세 가지다.',
          '- 컴파일 타임 위빙: AspectJ 컴파일러(ajc)가 컴파일할 때 바이트코드에 Advice를 삽입한다.',
          '- 로드 타임 위빙(LTW): 클래스 로더가 클래스를 JVM에 올릴 때 자바 에이전트가 바이트코드를 수정한다.',
          '- 런타임 위빙: 애플리케이션 실행 중에 프록시 객체를 만들어 원본 대신 사용한다. 스프링 AOP의 방식이다.',
          '런타임 위빙은 별도 컴파일러나 JVM 옵션이 필요 없어 간단하지만, 프록시가 가로챌 수 있는 메서드 실행에만 적용된다.'
        ],
        rel: ['Spring AOP', 'AspectJ', 'BeanPostProcessor'] }
    ]},
    { name: 'Advice 종류', items: [
      { t: '@Before', deep: false,
        d: '대상 메서드가 실행되기 전에 실행되는 Advice다.',
        how: [
          'Advice가 끝나면 대상 메서드가 자동으로 실행된다. 대상 실행을 막으려면 예외를 던지는 방법밖에 없다.',
          '- 쓰임: 파라미터 검증, 권한 확인, 호출 로그',
          '- `JoinPoint`로 인자를 읽을 수 있지만 인자를 바꿔 넘길 수는 없다. 인자를 바꾸려면 `@Around`를 쓴다.'
        ],
        code: `@Before("@annotation(com.shop.AdminOnly)")
public void checkAdmin(JoinPoint jp) {
    if (!currentUser.isAdmin()) throw new AccessDeniedException("관리자 전용");
}`,
        rel: ['@Around', 'Advice'] },
      { t: '@AfterReturning', deep: false,
        d: '대상 메서드가 예외 없이 정상 반환한 뒤 실행되는 Advice다.',
        how: [
          '`returning` 속성으로 반환값을 파라미터로 받을 수 있다. 반환값의 타입이 파라미터 타입과 맞지 않으면 Advice가 실행되지 않는다.',
          '- 쓰임: 결과 로그, 결과 기반 후처리(알림 발송 등)',
          '- 반환 객체의 내부 상태는 바꿀 수 있지만 반환값 자체를 다른 객체로 바꿀 수는 없다. 바꾸려면 `@Around`를 쓴다.'
        ],
        code: `@AfterReturning(pointcut = "allService()", returning = "result")
public void logResult(JoinPoint jp, Object result) {
    log.info("{} -> {}", jp.getSignature().getName(), result);
}`,
        rel: ['@AfterThrowing', '@After'] },
      { t: '@AfterThrowing', deep: false,
        d: '대상 메서드가 예외를 던졌을 때 실행되는 Advice다.',
        how: [
          '`throwing` 속성으로 발생한 예외를 파라미터로 받는다. 파라미터 타입에 맞는 예외일 때만 실행된다.',
          '- 쓰임: 예외 로그, 장애 알림, 예외 통계',
          '- Advice가 끝나면 예외는 그대로 호출자에게 전파된다. 예외를 삼키거나 다른 예외로 바꾸려면 `@Around`에서 try-catch를 쓴다.'
        ],
        code: `@AfterThrowing(pointcut = "allService()", throwing = "ex")
public void alert(JoinPoint jp, RuntimeException ex) {
    slack.send(jp.getSignature() + " 실패: " + ex.getMessage());
}`,
        rel: ['@AfterReturning', '@Around'] },
      { t: '@After', deep: false,
        d: '정상 반환이든 예외든 상관없이 대상 메서드가 끝나면 항상 실행되는 Advice다.',
        how: [
          '자바의 finally 블록과 같은 역할이다. 반환값이나 예외 정보는 받을 수 없다.',
          '- 쓰임: 리소스 정리, ThreadLocal 정리, 실행 종료 로그',
          '- 같은 Aspect 안에서 `@AfterReturning`이나 `@AfterThrowing`보다 나중에 실행된다.'
        ],
        rel: ['@AfterReturning', '@AfterThrowing'] },
      { t: '@Around', deep: false,
        d: '대상 메서드 실행 전후를 모두 감싸고, 실행 여부까지 직접 제어하는 가장 강력한 Advice다.',
        how: [
          '파라미터로 `ProceedingJoinPoint`를 받고, `proceed()`를 호출해야 대상 메서드가 실행된다. 그래서 다른 Advice로는 할 수 없는 일이 가능하다.',
          '- 실행하지 않기(캐시 히트 시 바로 반환), 여러 번 실행하기(재시도)',
          '- 인자 바꾸기: `proceed(newArgs)`',
          '- 반환값 바꾸기, 예외를 잡아 다른 예외로 바꾸기',
          '- 실행 시간 측정처럼 전후 정보가 모두 필요한 작업',
          '같은 Aspect 안에서의 실행 순서는 Around 시작 → Before → 대상 → AfterReturning/AfterThrowing → After → Around 종료다.'
        ],
        code: `@Around("@annotation(com.shop.Retry)")
public Object retry(ProceedingJoinPoint pjp) throws Throwable {
    for (int i = 1; ; i++) {
        try {
            return pjp.proceed();
        } catch (TransientException e) {
            if (i == 3) throw e;
        }
    }
}`,
        warn: [
          '`proceed()` 호출을 빠뜨리면 대상 메서드가 아예 실행되지 않는다.',
          '반환값을 돌려주지 않으면(`void`로 선언하는 등) 호출자가 null을 받는다.',
          '필요한 기능만 쓰는 좁은 Advice(`@Before` 등)로 충분하면 그쪽을 쓰는 것이 의도가 명확하고 실수가 적다.'
        ],
        rel: ['@Before', 'Advice', 'Aspect 실행 순서'] }
    ]},
    { name: '프록시 방식', items: [
      { t: 'JDK 동적 프록시', deep: true,
        d: '대상이 구현한 인터페이스를 똑같이 구현하는 프록시를 런타임에 만드는 자바 기본 기능이다.',
        why: '스프링 AOP는 원본 객체 대신 프록시를 빈으로 등록해야 부가 기능을 끼워 넣을 수 있다. 인터페이스 기반으로 프록시를 만드는 표준 방법이 JDK 동적 프록시다.',
        how: [
          '`java.lang.reflect.Proxy.newProxyInstance()`에 인터페이스 목록과 `InvocationHandler`를 넘기면, JVM이 그 인터페이스를 구현한 클래스(`$Proxy12` 같은 이름)를 런타임에 만든다.',
          '1) 클라이언트가 프록시의 인터페이스 메서드를 호출한다.',
          '2) 프록시는 모든 호출을 `InvocationHandler.invoke(proxy, method, args)`로 넘긴다.',
          '3) 핸들러가 부가 기능을 실행하고 `method.invoke(target, args)`로 원본 메서드를 호출한다.',
          '- 프록시는 인터페이스를 구현할 뿐 원본 클래스와는 상속 관계가 없다.',
          '- 그래서 구체 클래스 타입(`OrderServiceImpl`)으로 주입받으면 타입이 맞지 않아 `BeanNotOfRequiredTypeException`이 난다.',
          '- 스프링 부트는 2.0부터 기본으로 CGLIB을 쓰므로, `spring.aop.proxy-target-class=false`로 설정해야 인터페이스가 있는 빈에 JDK 동적 프록시가 쓰인다.'
        ],
        code: `OrderService proxy = (OrderService) Proxy.newProxyInstance(
    OrderService.class.getClassLoader(),
    new Class<?>[]{OrderService.class},
    (p, method, args) -> {
        long start = System.nanoTime();
        try {
            return method.invoke(target, args);
        } finally {
            log.info("{} {}ns", method.getName(), System.nanoTime() - start);
        }
    });`,
        warn: [
          '인터페이스가 없는 클래스에는 쓸 수 없다.',
          '인터페이스에 선언되지 않은 public 메서드는 프록시를 통해 호출할 수 없어 AOP가 적용되지 않는다.',
          '리플렉션 호출이라 아주 약간의 오버헤드가 있지만 실무 성능에 영향을 줄 정도는 아니다.'
        ],
        qa: ['JDK 동적 프록시와 CGLIB의 차이는 무엇인가요?', 'JDK 동적 프록시는 대상의 인터페이스를 구현해 프록시를 만들기 때문에 인터페이스가 반드시 필요하고, 구체 클래스 타입으로는 주입받을 수 없습니다. CGLIB은 대상 클래스를 상속해 프록시를 만들어 인터페이스가 없어도 되지만 final 클래스나 메서드는 프록시할 수 없습니다. 스프링 부트는 타입 문제를 피하려고 기본으로 CGLIB을 씁니다.'],
        rel: ['CGLIB 프록시', 'Target', 'Spring AOP'] },
      { t: 'CGLIB 프록시', deep: true,
        d: '바이트코드를 생성해 대상 클래스를 상속한 자식 클래스를 프록시로 만드는 방식이다.',
        why: '인터페이스가 없는 클래스에도 AOP를 적용하고, 구체 클래스 타입으로 주입받아도 문제가 없게 하려면 상속 기반 프록시가 필요하다. 스프링 부트의 기본 프록시 방식이다.',
        how: [
          'CGLIB(Code Generator Library)은 런타임에 `OrderService$$SpringCGLIB$$0` 같은 하위 클래스를 만들고, 오버라이드 가능한 메서드를 모두 재정의해 `MethodInterceptor`로 넘긴다. 스프링은 CGLIB을 `spring-core` 안에 재패키징해 포함하고 있다.',
          '1) 컨테이너가 원본 빈을 만든다.',
          '2) 초기화 후 단계에서 자동 프록시 생성기(BeanPostProcessor)가 적용할 Advisor가 있는지 확인한다.',
          '3) 있으면 원본 클래스를 상속한 프록시 객체를 만들어 원본 대신 컨테이너에 등록한다.',
          '4) 프록시의 메서드가 호출되면 인터셉터 체인(Advice들)을 실행한 뒤 원본 객체의 메서드를 호출한다.',
          '- 스프링 부트 2.0부터 `spring.aop.proxy-target-class=true`가 기본값이라 인터페이스가 있어도 CGLIB을 쓴다.',
          '- 예전에는 기본 생성자가 필요하고 생성자가 두 번 호출되는 문제가 있었지만, 스프링 4부터 Objenesis로 생성자 호출 없이 프록시 인스턴스를 만들어 해결되었다.',
          '- `@Configuration` 클래스도 같은 방식으로 프록시되어 `@Bean` 메서드의 싱글톤을 보장한다.'
        ],
        code: `@Service
public class OrderService {          // 인터페이스 없음
    @Transactional
    public void order(Long id) { ... }
}

// 주입받는 것은 프록시
@Autowired OrderService orderService;
orderService.getClass();
// class com.shop.OrderService$$SpringCGLIB$$0`,
        warn: [
          'final 클래스는 상속할 수 없어 프록시가 만들어지지 않고, final 메서드는 오버라이드할 수 없어 AOP가 적용되지 않는다.',
          'Kotlin 클래스는 기본이 final이라 `kotlin-spring`(allopen) 플러그인이 필요하다.',
          'private 메서드는 오버라이드할 수 없어 적용되지 않는다. 스프링 6부터 protected·package-private 메서드에는 적용된다.',
          '프록시 내부에서 원본의 다른 메서드를 부르는 셀프 호출에는 적용되지 않는다.'
        ],
        qa: ['스프링 부트는 왜 기본으로 CGLIB을 쓰나요?', 'JDK 동적 프록시는 인터페이스를 구현할 뿐이라 구체 클래스 타입으로 주입받으면 타입 불일치 오류가 납니다. CGLIB은 대상 클래스를 상속하므로 어떤 타입으로 주입받아도 문제가 없고, 예전의 기본 생성자 문제도 Objenesis로 해결되어 단점이 줄었기 때문에 부트 2.0부터 기본값이 되었습니다. 대신 final 클래스와 메서드에는 적용되지 않는다는 점을 주의해야 합니다.'],
        rel: ['JDK 동적 프록시', '셀프 호출 문제', 'BeanPostProcessor', '@Configuration 프록시'] }
    ]},
    { name: 'AOP 구현 방식', items: [
      { t: 'Spring AOP', deep: false,
        d: '런타임에 프록시를 만들어 스프링 빈의 메서드 실행에 부가 기능을 적용하는 스프링의 AOP 구현이다.',
        how: [
          '빈이 생성될 때 BeanPostProcessor가 프록시로 바꿔치기하고, 프록시를 통해 들어오는 호출에만 Advice가 적용된다.',
          '- 장점: 별도 컴파일러나 JVM 에이전트가 필요 없고 설정이 간단하다. 트랜잭션, 캐시, 로깅 같은 대부분의 실무 요구를 충족한다.',
          '- 한계: 스프링 빈에만, 메서드 실행에만 적용된다. 셀프 호출, private 메서드, final 메서드, 생성자, 필드 접근에는 적용되지 않는다.',
          '- AspectJ의 애너테이션(`@Aspect`, `@Before` 등)과 포인트컷 문법만 빌려 쓰고 실제 위빙은 자체 프록시로 한다. `spring-boot-starter-aop` 의존성으로 활성화된다.'
        ],
        rel: ['AspectJ', 'Weaving', 'CGLIB 프록시'] },
      { t: 'AspectJ', deep: false,
        d: '바이트코드 자체를 수정해 부가 기능을 넣는 완전한 AOP 프레임워크다.',
        how: [
          '컴파일 시점(ajc 컴파일러)이나 클래스 로드 시점(LTW, `-javaagent`)에 클래스 파일을 직접 바꾼다. 프록시가 없으므로 객체 내부 호출에도 적용된다.',
          '- 적용 범위: 생성자, 필드 읽기·쓰기, static 메서드, private 메서드, 같은 클래스 안의 호출, 스프링 빈이 아닌 객체까지',
          '- 단점: 빌드 설정이나 JVM 옵션이 필요해 복잡하고, 바이트코드가 바뀌어 디버깅이 어려울 수 있다.',
          '- 스프링에서는 `@EnableLoadTimeWeaving`이나 `@Transactional(mode = AdviceMode.ASPECTJ)`처럼 꼭 필요한 경우에만 쓴다.'
        ],
        rel: ['Spring AOP', 'Weaving', 'JoinPoint'] }
    ]},
    { name: 'AOP 주의점', items: [
      { t: '셀프 호출 문제', deep: true,
        d: '같은 클래스 안에서 `this`로 메서드를 호출하면 프록시를 거치지 않아 AOP가 적용되지 않는 문제다.',
        why: '`@Transactional`, `@Async`, `@Cacheable`이 "붙어 있는데 동작하지 않는" 대표 원인이다. 프록시 구조를 이해하지 못하면 데이터 정합성 버그로 이어진다.',
        how: [
          '컨테이너에는 프록시가 등록되어 있고, 프록시가 원본(Target)을 감싸고 있다.',
          '1) 컨트롤러가 `orderService.external()`을 호출하면 프록시가 받는다.',
          '2) `external()`에는 Advice가 없으므로 프록시는 바로 원본의 `external()`을 호출한다.',
          '3) 원본 안에서 `this.internal()`을 부른다. 여기서 `this`는 프록시가 아니라 원본 객체다.',
          '4) 원본의 `internal()`이 바로 실행되어 `@Transactional`이 붙어 있어도 트랜잭션이 시작되지 않는다.',
          '해결 방법은 다음과 같다.',
          '- 별도 빈으로 분리(가장 권장): `internal()`을 다른 클래스로 옮겨 주입받아 호출한다. 외부 호출이 되므로 프록시를 거친다.',
          '- 자기 자신을 지연 주입: `ObjectProvider<OrderService>`로 프록시를 받아 호출한다. 구조가 어색해 권장하지 않는다.',
          '- `AopContext.currentProxy()`: `@EnableAspectJAutoProxy(exposeProxy = true)`가 필요하고 코드가 AOP에 묶인다.',
          '- AspectJ 위빙: 바이트코드를 바꾸므로 내부 호출에도 적용되지만 설정이 복잡하다.'
        ],
        code: `@Service
public class OrderService {
    public void external() {
        internal();               // this.internal() → 프록시를 거치지 않음
    }
    @Transactional
    public void internal() { ... } // 트랜잭션 시작 안 됨
}

// 해결: 별도 빈으로 분리
@Service
@RequiredArgsConstructor
public class OrderFacade {
    private final OrderWriter writer; // writer.internal()은 프록시를 거친다
}`,
        warn: [
          '`@Async` 메서드를 같은 클래스에서 부르면 비동기가 아니라 동기로 실행된다.',
          '`@Cacheable` 메서드를 내부에서 부르면 캐시를 거치지 않고 매번 실행된다.',
          '테스트에서 서비스를 직접 호출하면 정상 동작해 보여도, 실제 호출 경로가 내부 호출이면 운영에서만 문제가 드러날 수 있다.'
        ],
        qa: ['같은 클래스의 @Transactional 메서드를 호출하면 왜 트랜잭션이 적용되지 않나요?', '스프링 AOP는 프록시 기반이라 외부에서 프록시를 통해 들어온 호출에만 Advice가 적용됩니다. 같은 클래스 안에서 호출하면 this, 즉 원본 객체의 메서드를 바로 부르므로 프록시의 트랜잭션 인터셉터가 실행되지 않습니다. 그래서 해당 메서드를 별도 빈으로 분리해 외부 호출이 되도록 하는 방법을 가장 많이 씁니다.'],
        rel: ['CGLIB 프록시', 'Target', 'AspectJ', '@Transactional 동작 원리'] },
      { t: 'Aspect 실행 순서', deep: false,
        d: '하나의 메서드에 여러 Aspect가 적용될 때 어느 Aspect가 먼저 실행될지 정하는 규칙이다.',
        how: [
          '순서를 지정하지 않으면 실행 순서가 보장되지 않는다. Aspect 클래스에 `@Order(1)`처럼 지정하거나 `Ordered` 인터페이스를 구현한다. 숫자가 작을수록 바깥쪽(먼저 시작, 나중에 끝남)에서 실행된다.',
          '- `@Order`는 클래스 단위로만 적용된다. 같은 Aspect 안의 Advice끼리 순서를 정하고 싶으면 Aspect를 나눈다.',
          '- 트랜잭션(`@EnableTransactionManagement(order = ...)`)과 커스텀 Aspect의 순서가 중요할 때가 있다. 예: 재시도 Aspect가 트랜잭션보다 바깥에 있어야 재시도마다 새 트랜잭션이 열린다.'
        ],
        code: `@Aspect @Order(1) @Component
public class RetryAspect { ... }       // 바깥: 재시도마다

@Aspect @Order(2) @Component
public class LogAspect { ... }         // 안쪽`,
        rel: ['Aspect', '@Around'] }
    ]}
  ],
  must: [
    'AOP는 프록시를 거치는 외부 호출에만 적용된다. 내부 호출과 private 메서드는 대상이 아니다.',
    'final 클래스와 메서드는 CGLIB이 상속할 수 없다. Kotlin은 `allopen`(kotlin-spring) 플러그인이 필요하다.',
    '여러 Aspect의 실행 순서는 `@Order`로 정한다. 순서를 정하지 않으면 보장되지 않는다.',
    '빈의 `getClass()`를 찍으면 `$$SpringCGLIB$$`가 붙은 프록시 클래스가 보인다.'
  ]
};
