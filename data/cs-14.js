(window.MINDMAP = window.MINDMAP || {})['cs-14'] = {
  name: '인프라 · 배포',
  groups: [
    { name: '가상화 · 컨테이너', items: [
      { t: '가상 머신', deep: false,
        d: '하이퍼바이저 위에서 게스트 OS까지 통째로 실행해, 물리 서버 하나를 여러 대의 독립된 컴퓨터처럼 쓰는 기술이다.',
        how: [
          '하이퍼바이저(VMware ESXi, KVM, Hyper-V)가 CPU, 메모리, 디스크, 네트워크를 가상화해 각 VM에 나눠 준다. VM마다 자기 커널을 가진 완전한 OS가 올라간다.',
          '- Type 1(베어메탈): 하드웨어 위에 하이퍼바이저가 바로 올라간다. 클라우드 서버(AWS EC2 등)가 이 방식이다.',
          '- Type 2(호스트형): 일반 OS 위에서 프로그램으로 실행된다. VirtualBox, Parallels.',
          '- 장점: OS 수준까지 격리되어 보안 경계가 강하고, 서로 다른 OS(리눅스와 윈도우)를 한 서버에서 돌릴 수 있다.',
          '- 단점: VM마다 OS를 통째로 띄우므로 이미지가 수 GB이고, 부팅에 수십 초~수 분이 걸리며, 메모리 오버헤드가 크다.'
        ],
        warn: ['VM 하나에 여러 서비스를 몰아 넣으면 배포와 확장 단위가 커진다. 최근에는 VM 위에 컨테이너를 올려 함께 쓰는 구성이 일반적이다.'],
        rel: ['컨테이너', '네임스페이스 · cgroup'] },
      { t: '컨테이너', deep: true,
        d: '호스트 OS의 커널을 공유하면서, 애플리케이션과 그 실행 환경(라이브러리, 설정)을 격리된 프로세스로 실행하는 기술이다.',
        why: '"내 PC에서는 되는데 서버에서는 안 된다"는 환경 차이 문제를 없애고, VM보다 훨씬 가볍게 빠르게 띄우고 버리기 위해서다. 같은 이미지를 개발·테스트·운영 어디서나 똑같이 실행할 수 있다.',
        how: [
          '컨테이너는 특별한 가상 컴퓨터가 아니라 리눅스 커널 기능으로 격리된 "일반 프로세스"다.',
          '1) 이미지의 읽기 전용 레이어들을 겹치고(overlayfs) 그 위에 쓰기 가능한 컨테이너 레이어를 얹어 파일 시스템을 만든다.',
          '2) 네임스페이스로 PID, 네트워크, 마운트, 호스트명 등을 분리해 컨테이너 안에서는 자기만 있는 것처럼 보이게 한다.',
          '3) cgroup으로 CPU, 메모리 사용량을 제한한다.',
          '4) 이미지에 정의된 명령(ENTRYPOINT)을 PID 1 프로세스로 실행한다. 이 프로세스가 끝나면 컨테이너도 종료된다.',
          '- VM과 비교: 게스트 OS가 없어 이미지가 수십~수백 MB이고, 몇 초 안에 시작되며, 한 서버에 훨씬 많이 띄울 수 있다.',
          '- 불변 인프라: 서버에 접속해 고치는 대신 새 이미지를 만들어 컨테이너를 교체한다.'
        ],
        code: `# 메모리·CPU 제한을 걸고 컨테이너 실행
docker run -d --name order-api \\
  -p 8080:8080 \\
  --memory=512m --cpus=1 \\
  -e SPRING_PROFILES_ACTIVE=prod \\
  registry.example.com/order-api:1.4.2

docker ps                # 실행 중인 컨테이너
docker logs -f order-api # 표준 출력 로그
docker exec -it order-api sh`,
        warn: [
          '컨테이너 안에 쓴 파일은 컨테이너를 지우면 사라진다. 남겨야 할 데이터는 볼륨이나 외부 저장소(DB, S3)에 둔다.',
          '커널을 공유하므로 VM보다 격리가 약하다. root로 실행하지 말고 `USER`로 일반 사용자를 지정한다.',
          'JVM은 컨테이너 메모리 제한을 기준으로 힙을 잡는다(Java 10+). 제한 없이 띄우거나 힙을 제한보다 크게 잡으면 OOMKilled로 강제 종료된다.'
        ],
        qa: ['VM과 컨테이너의 차이는 무엇인가요?', 'VM은 하이퍼바이저 위에 게스트 OS까지 통째로 올려 OS 수준으로 격리합니다. 컨테이너는 호스트 커널을 공유하고 네임스페이스와 cgroup으로 프로세스를 격리하는 방식이라 훨씬 가볍고 몇 초 만에 뜹니다. 대신 커널을 공유하므로 격리 강도는 VM보다 약합니다. 그래서 실무에서는 VM 위에서 컨테이너를 여러 개 띄워 둘의 장점을 함께 씁니다.'],
        rel: ['가상 머신', '네임스페이스 · cgroup', 'Docker 이미지'] },
      { t: '네임스페이스 · cgroup', deep: false,
        d: '리눅스 커널이 제공하는 두 가지 격리 기능으로, 네임스페이스는 "무엇이 보이는지"를, cgroup은 "얼마나 쓸 수 있는지"를 제한한다.',
        how: [
          '- 네임스페이스: PID(프로세스 번호), NET(네트워크 인터페이스·포트), MNT(파일 시스템 마운트), UTS(호스트명), IPC, USER(사용자 ID)를 분리한다. 그래서 컨테이너 안의 앱은 자신이 PID 1이고 전용 네트워크를 가진 것처럼 보인다.',
          '- cgroup(control group): 프로세스 그룹이 쓸 수 있는 CPU 시간, 메모리, 디스크 I/O를 제한하고 측정한다. 메모리 한도를 넘으면 커널의 OOM Killer가 프로세스를 죽인다.',
          'Docker와 Kubernetes는 이 기능들을 편하게 쓰도록 감싼 도구다. 컨테이너 런타임(containerd, runc)이 실제로 네임스페이스와 cgroup을 설정한다.'
        ],
        warn: ['CPU 제한(cgroup quota)이 걸리면 스레드가 많아도 할당된 CPU 시간만큼만 실행된다. 스레드 풀 크기와 GC 스레드 수를 제한에 맞춰 정한다.'],
        rel: ['컨테이너', '가상 머신'] }
    ]},
    { name: 'Docker', items: [
      { t: 'Docker 이미지', deep: true,
        d: '컨테이너를 실행하는 데 필요한 파일 시스템과 실행 설정을 담은 읽기 전용 템플릿이다. 이미지를 실행한 인스턴스가 컨테이너다.',
        why: '애플리케이션과 실행 환경(JDK 버전, 라이브러리, 설정)을 하나로 묶어 버전 관리하고, 어디서나 똑같이 실행하기 위해서다. 클래스와 객체의 관계처럼 이미지 하나로 컨테이너를 여러 개 만든다.',
        how: [
          '- 레이어 구조: 이미지는 Dockerfile 명령마다 만들어지는 읽기 전용 레이어의 묶음이다. 같은 베이스 레이어(예: eclipse-temurin:21-jre)는 여러 이미지가 공유해 저장 공간과 전송량을 아낀다.',
          '- 컨테이너 레이어: 컨테이너가 실행되면 이미지 위에 얇은 쓰기 가능 레이어가 생긴다. 파일을 수정하면 아래 레이어에서 복사해 와서 고친다(Copy-on-Write).',
          '- 태그와 다이제스트: `order-api:1.4.2`처럼 태그로 이름을 붙이지만, 태그는 다른 이미지로 다시 붙일 수 있다. 내용 해시인 다이제스트(`sha256:...`)는 바뀌지 않아 정확히 같은 이미지를 가리킨다.',
          '- 레지스트리: Docker Hub, ECR, GHCR 같은 저장소에 push하고, 서버에서 pull해 실행한다.',
          '빌드 흐름: Dockerfile 작성 → `docker build` → 태그 → `docker push` → 서버에서 `docker pull` 후 실행.'
        ],
        code: `docker build -t order-api:1.4.2 .
docker tag order-api:1.4.2 registry.example.com/order-api:1.4.2
docker push registry.example.com/order-api:1.4.2

docker images                    # 로컬 이미지 목록
docker history order-api:1.4.2   # 레이어별 크기 확인
docker image inspect order-api:1.4.2 --format "{{.RepoDigests}}"`,
        warn: [
          '`latest` 태그로 배포하면 어떤 버전이 떠 있는지 알 수 없고 롤백도 어렵다. 버전 태그나 다이제스트로 고정한다.',
          '이미지에 비밀번호, API 키를 넣으면 레이어에 영원히 남아 누구나 꺼내 볼 수 있다. 실행 시 환경 변수나 Secret으로 주입한다.',
          '베이스 이미지는 JDK가 아닌 JRE, 가능하면 slim·distroless 계열을 써서 크기와 취약점 수를 줄인다.'
        ],
        qa: ['Docker 이미지와 컨테이너의 차이를 설명해 주세요.', '이미지는 실행에 필요한 파일과 설정을 담은 읽기 전용 템플릿이고, 컨테이너는 그 이미지를 실행한 인스턴스입니다. 이미지는 레이어로 구성되어 공통 레이어를 공유하고, 컨테이너는 그 위에 쓰기 가능한 레이어를 하나 더 얹어 실행됩니다. 그래서 같은 이미지로 컨테이너를 여러 개 띄울 수 있고, 컨테이너를 지우면 쓰기 레이어의 변경 내용은 사라집니다.'],
        rel: ['컨테이너', 'Dockerfile', '레이어 캐시', '컨테이너 레지스트리'] },
      { t: 'Dockerfile', deep: false,
        d: '이미지를 어떻게 만들지 명령어로 적은 빌드 스크립트다.',
        how: [
          '- `FROM`: 베이스 이미지 지정. 모든 Dockerfile의 시작이다.',
          '- `WORKDIR`: 이후 명령이 실행될 작업 디렉터리.',
          '- `COPY` / `ADD`: 파일을 이미지 안으로 복사한다. 원격 URL·압축 해제가 필요 없으면 `COPY`를 쓴다.',
          '- `RUN`: 빌드 시점에 명령을 실행하고 그 결과를 새 레이어로 저장한다(패키지 설치, 빌드).',
          '- `ENV`, `ARG`: 환경 변수와 빌드 인자.',
          '- `EXPOSE`: 문서용으로 사용할 포트를 표시한다. 실제 포트 공개는 실행 시 `-p`로 한다.',
          '- `USER`: 실행 사용자 지정. root 대신 일반 사용자를 쓴다.',
          '- `ENTRYPOINT` / `CMD`: 컨테이너 시작 명령. ENTRYPOINT는 고정 실행 파일, CMD는 기본 인자로 쓰는 것이 관례다.',
          '`.dockerignore`로 `.git`, `build`, 로컬 설정 파일을 빌드 컨텍스트에서 빼면 빌드가 빨라지고 민감 정보 유출을 막는다.'
        ],
        warn: ['`ENTRYPOINT java -jar app.jar`처럼 셸 형식으로 쓰면 셸이 PID 1이 되어 종료 신호(SIGTERM)가 자바 프로세스에 전달되지 않을 수 있다. `["java", "-jar", "app.jar"]` 같은 exec 형식을 쓴다.'],
        rel: ['Docker 이미지', '레이어 캐시', '멀티 스테이지 빌드', 'Graceful Shutdown'] },
      { t: '레이어 캐시', deep: false,
        d: 'Docker가 Dockerfile 명령과 입력 파일이 이전 빌드와 같으면 그 레이어를 다시 만들지 않고 재사용하는 기능이다.',
        how: [
          '빌드는 위에서부터 한 줄씩 진행되며, 한 레이어의 캐시가 깨지면 그 아래 모든 레이어를 다시 만든다.',
          '그래서 잘 바뀌지 않는 것을 위에, 자주 바뀌는 것을 아래에 둔다.',
          '- 좋은 순서: 빌드 설정 파일(build.gradle) 복사 → 의존성 다운로드 → 소스 코드 복사 → 빌드.',
          '- 나쁜 순서: 소스 전체를 먼저 `COPY . .` 하면 코드 한 줄만 바꿔도 의존성 다운로드부터 다시 한다.',
          '- 스프링 부트 레이어드 JAR: `java -Djarmode=tools -jar app.jar extract --layers`로 의존성, 스냅샷 의존성, 애플리케이션 코드를 레이어로 나누면 코드만 바뀔 때 작은 레이어만 새로 전송된다.'
        ],
        warn: ['`RUN apt-get update`를 설치 명령과 다른 줄에 쓰면 오래된 캐시가 재사용되어 패키지 목록이 낡을 수 있다. `apt-get update && apt-get install -y ...`를 한 줄로 쓴다.'],
        rel: ['Dockerfile', '멀티 스테이지 빌드', 'Docker 이미지'] },
      { t: '멀티 스테이지 빌드', deep: true,
        d: '하나의 Dockerfile에 빌드용 단계와 실행용 단계를 나눠, 최종 이미지에는 실행에 필요한 결과물만 담는 방식이다.',
        why: '빌드에는 JDK, Gradle, 소스 코드, 의존성 캐시가 필요하지만 실행에는 JRE와 JAR 하나면 된다. 이를 한 이미지에 다 넣으면 이미지가 수백 MB 커지고, 소스와 빌드 도구가 노출되어 보안 공격 면도 넓어진다.',
        how: [
          '1) 첫 번째 `FROM ... AS build` 단계에서 JDK 이미지로 의존성을 받고 애플리케이션을 빌드한다.',
          '2) 두 번째 `FROM` 단계는 가벼운 JRE 이미지에서 새로 시작한다.',
          '3) `COPY --from=build`로 첫 단계의 결과물(JAR)만 가져온다.',
          '4) 최종 이미지에는 마지막 단계의 레이어만 남고, 빌드 단계의 JDK·소스·캐시는 포함되지 않는다.',
          '- 효과: 이미지 크기 감소(예: 700MB → 250MB), 전송·배포 시간 단축, 취약점 노출 감소.',
          '- 빌드 단계에서도 의존성 복사를 먼저 해 두면 레이어 캐시가 잘 맞는다.'
        ],
        code: `FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY gradlew settings.gradle build.gradle ./
COPY gradle gradle
RUN ./gradlew dependencies --no-daemon     # 의존성 레이어 캐시
COPY src src
RUN ./gradlew bootJar --no-daemon

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
RUN useradd -r app && chown app /app
USER app
EXPOSE 8080
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "app.jar"]`,
        warn: [
          '`build/libs`에 plain JAR와 실행 JAR가 함께 생기면 `*.jar` 복사가 실패하거나 엉뚱한 파일이 들어간다. 부트 3에서는 `jar { enabled = false }`로 plain JAR 생성을 끄거나 파일명을 지정한다.',
          '테스트까지 이미지 빌드 안에서 돌리면 빌드가 느려진다. 테스트는 CI 단계에서 따로 실행하고 이미지 빌드는 패키징만 하는 것이 일반적이다.'
        ],
        qa: ['멀티 스테이지 빌드를 쓰는 이유는 무엇인가요?', '빌드에 필요한 JDK, 빌드 도구, 소스 코드가 최종 이미지에 들어가지 않게 하려고 씁니다. 첫 단계에서 JDK로 빌드하고, 두 번째 단계에서는 JRE 이미지에 결과물 JAR만 복사합니다. 그러면 이미지가 작아져 배포가 빨라지고, 불필요한 도구가 없어 보안상 공격 면도 줄어듭니다.'],
        rel: ['Dockerfile', '레이어 캐시', 'Docker 이미지'] },
      { t: 'Docker Compose', deep: false,
        d: '여러 컨테이너(애플리케이션, DB, Redis 등)를 YAML 파일 하나로 정의하고 한 번에 띄우고 내리는 도구다.',
        how: [
          '`compose.yaml`에 서비스별 이미지, 포트, 환경 변수, 볼륨, 의존 관계를 적고 `docker compose up -d`로 실행한다.',
          '- 같은 Compose 프로젝트의 컨테이너는 전용 네트워크로 묶여, 서비스 이름(예: `mysql`)으로 서로를 찾는다.',
          '- 볼륨을 지정하면 컨테이너를 지워도 DB 데이터가 남는다.',
          '- 주 용도는 로컬 개발 환경과 통합 테스트 환경이다. 스프링 부트 3.1+는 `spring-boot-docker-compose`로 애플리케이션 실행 시 Compose를 자동으로 띄울 수 있다.',
          '여러 서버에 걸친 배포, 자동 복구, 오토스케일링은 Compose의 범위가 아니라 Kubernetes 같은 오케스트레이터가 맡는다.'
        ],
        code: `services:
  app:
    image: order-api:1.4.2
    ports: ["8080:8080"]
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/shop
    depends_on: [mysql]
  mysql:
    image: mysql:8.4
    environment:
      MYSQL_DATABASE: shop
      MYSQL_ROOT_PASSWORD: local-only
    volumes: ["mysql-data:/var/lib/mysql"]
volumes:
  mysql-data:`,
        warn: ['`depends_on`은 시작 순서만 보장하고 DB가 접속 가능한 상태인지는 보장하지 않는다. 헬스 체크 조건(`condition: service_healthy`)을 함께 쓴다.'],
        rel: ['컨테이너', 'Kubernetes'] },
      { t: '컨테이너 레지스트리', deep: false,
        d: '빌드한 이미지를 저장하고 버전별로 배포하는 이미지 저장소다.',
        how: [
          '- 공개 레지스트리: Docker Hub. 공식 베이스 이미지를 받는다.',
          '- 사설 레지스트리: AWS ECR, Google Artifact Registry, GitHub Container Registry(GHCR), Harbor. 회사 애플리케이션 이미지를 둔다.',
          'CI가 이미지를 빌드해 레지스트리에 push하고, 배포 대상(Kubernetes 등)이 그 이미지를 pull해 실행한다. 레지스트리가 빌드와 배포를 잇는 중간 지점이다.',
          '- 이미지 취약점 스캔, 오래된 태그 자동 삭제(수명 주기 정책), 태그 덮어쓰기 금지(immutable tag) 설정을 함께 쓴다.'
        ],
        rel: ['Docker 이미지', 'CI'] }
    ]},
    { name: 'Kubernetes 기본', items: [
      { t: 'Kubernetes', deep: false,
        d: '여러 서버에 걸쳐 컨테이너의 배포, 확장, 자동 복구, 네트워크 연결을 관리하는 컨테이너 오케스트레이션 플랫폼이다.',
        how: [
          '개발자는 "이 이미지로 Pod 3개를 항상 유지해 줘"처럼 원하는 상태를 YAML로 선언하고, Kubernetes는 실제 상태를 계속 관찰하며 원하는 상태로 맞춘다(선언적 관리, 컨트롤 루프).',
          '- 컨트롤 플레인: API 서버(모든 요청의 입구), etcd(클러스터 상태 저장소), 스케줄러(Pod를 어느 노드에 둘지 결정), 컨트롤러 매니저(원하는 상태 유지).',
          '- 워커 노드: kubelet(노드에서 Pod 실행·관리), 컨테이너 런타임(containerd), kube-proxy(Service 네트워크 규칙).',
          '- 제공 기능: 자동 복구(죽은 컨테이너 재시작, 노드 장애 시 다른 노드로 재배치), 롤링 업데이트와 롤백, 오토스케일링, 서비스 디스커버리와 로드 밸런싱, 설정·시크릿 관리.'
        ],
        warn: ['작은 서비스 몇 개에는 운영 복잡도가 크다. 관리형 서비스(EKS, GKE)를 쓰거나, 규모가 작으면 더 단순한 배포 방식(ECS, 단일 VM + Compose)도 검토한다.'],
        rel: ['Pod', 'Deployment', 'K8s Service'] },
      { t: 'Pod', deep: true,
        d: 'Kubernetes에서 배포하고 관리하는 가장 작은 단위로, 같은 네트워크와 저장소를 공유하는 컨테이너 1개 이상의 묶음이다.',
        why: 'Kubernetes는 컨테이너를 직접 다루지 않고 Pod 단위로 스케줄링하고 재시작한다. 로그 수집기나 프록시처럼 앱 옆에 항상 붙어 다녀야 하는 보조 컨테이너를 함께 묶을 수 있게 하기 위해서다.',
        how: [
          '- 같은 Pod의 컨테이너들은 같은 노드에 배치되고, IP 하나와 포트 공간을 공유해 `localhost`로 서로 통신한다.',
          '- 볼륨을 공유해 파일을 주고받을 수 있다.',
          '- 보통 Pod 하나에 앱 컨테이너 하나를 둔다. 보조 컨테이너를 붙이는 것을 사이드카 패턴이라 한다(로그 수집, 서비스 메시 프록시).',
          '- Pod는 언제든 죽고 새로 만들어지는 일회용이다. 새 Pod는 IP가 바뀌므로 Pod IP에 직접 접속하지 않고 Service를 통한다.',
          '- 생명주기: Pending(스케줄 대기·이미지 받는 중) → Running → Succeeded/Failed. 재시작이 반복되면 CrashLoopBackOff 상태가 된다.',
          '보통 Pod를 직접 만들지 않고 Deployment가 Pod를 원하는 개수만큼 만들고 관리하게 한다.'
        ],
        code: `apiVersion: v1
kind: Pod
metadata:
  name: order-api
  labels: { app: order-api }
spec:
  containers:
    - name: app
      image: registry.example.com/order-api:1.4.2
      ports: [{ containerPort: 8080 }]
      resources:
        requests: { cpu: 500m, memory: 512Mi }
        limits: { memory: 768Mi }

# kubectl get pods
# kubectl describe pod order-api   (이벤트·재시작 원인)
# kubectl logs order-api --previous (직전 컨테이너 로그)`,
        warn: [
          'resources.requests를 비워 두면 스케줄러가 자원을 계산하지 못해 한 노드에 Pod가 몰리고, limits를 넘은 메모리 사용은 OOMKilled로 이어진다.',
          'CrashLoopBackOff는 앱이 시작 직후 계속 죽는다는 뜻이다. `kubectl logs --previous`와 `describe`의 이벤트로 원인(설정 누락, OOM, 프로브 실패)을 찾는다.'
        ],
        qa: ['Pod와 컨테이너는 어떻게 다른가요?', 'Pod는 Kubernetes가 배포하고 스케줄링하는 최소 단위로, 네트워크와 볼륨을 공유하는 컨테이너 묶음입니다. 같은 Pod의 컨테이너는 같은 노드에서 같은 IP를 쓰며 localhost로 통신합니다. 보통 앱 컨테이너 하나를 두고, 로그 수집이나 프록시 같은 보조 컨테이너를 사이드카로 붙입니다. Pod는 일회용이라 직접 만들기보다 Deployment가 관리하게 합니다.'],
        rel: ['Deployment', 'K8s Service', 'liveness 프로브'] },
      { t: 'Deployment', deep: true,
        d: '원하는 Pod 개수와 이미지 버전을 선언해 두면, Pod를 그 상태로 유지하고 버전 교체(롤링 업데이트)와 롤백을 관리하는 Kubernetes 리소스다.',
        why: 'Pod는 죽으면 그대로 사라지므로, 항상 N개를 유지하고 새 버전으로 무중단 교체할 관리자가 필요하다. 상태가 없는 웹 애플리케이션 서버는 대부분 Deployment로 배포한다.',
        how: [
          '1) Deployment가 ReplicaSet을 만들고, ReplicaSet이 지정한 개수(replicas)만큼 Pod를 유지한다. Pod가 죽으면 즉시 새로 만든다.',
          '2) 이미지 태그를 바꾸면 새 ReplicaSet을 만들고, 새 Pod를 조금씩 늘리면서 옛 Pod를 줄인다(RollingUpdate).',
          '3) `maxSurge`(초과 생성 허용 수)와 `maxUnavailable`(동시에 빠져도 되는 수)로 교체 속도와 안정성을 조절한다.',
          '4) 새 Pod가 readiness 프로브를 통과해야 다음 단계로 진행하므로, 문제가 있는 버전은 교체가 멈춘다.',
          '5) 이전 ReplicaSet이 남아 있어 `kubectl rollout undo`로 바로 되돌릴 수 있다.',
          '상태를 가진 DB 같은 워크로드는 고정 이름과 전용 저장소가 필요해 StatefulSet을 쓴다.'
        ],
        code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: order-api
spec:
  replicas: 3
  selector:
    matchLabels: { app: order-api }
  strategy:
    type: RollingUpdate
    rollingUpdate: { maxSurge: 1, maxUnavailable: 0 }
  template:
    metadata:
      labels: { app: order-api }
    spec:
      containers:
        - name: app
          image: registry.example.com/order-api:1.4.2
          readinessProbe:
            httpGet: { path: /actuator/health/readiness, port: 8080 }

# kubectl rollout status deployment/order-api
# kubectl rollout undo deployment/order-api`,
        warn: [
          'readiness 프로브가 없으면 아직 기동 중인 Pod로 트래픽이 들어가 배포할 때마다 오류가 난다.',
          '`maxUnavailable: 0`, `maxSurge: 1`이면 안전하지만 노드에 여유 자원이 있어야 새 Pod가 뜬다.'
        ],
        qa: ['Deployment는 어떻게 무중단 배포를 하나요?', 'Deployment는 이미지가 바뀌면 새 ReplicaSet을 만들고, 새 Pod를 하나씩 늘리면서 옛 Pod를 줄이는 롤링 업데이트를 합니다. 새 Pod가 readiness 프로브를 통과해야 트래픽을 받고 다음 단계로 진행하므로 사용자 요청이 끊기지 않습니다. maxSurge와 maxUnavailable로 속도를 조절하고, 문제가 생기면 이전 ReplicaSet으로 rollout undo 해 바로 되돌립니다.'],
        rel: ['Pod', '롤링 배포', 'readiness 프로브', '롤백'] },
      { t: 'K8s Service', deep: false,
        d: '라벨로 고른 Pod 묶음에 변하지 않는 가상 IP와 DNS 이름을 붙이고, 들어온 트래픽을 그 Pod들에 나눠 주는 Kubernetes 리소스다.',
        how: [
          'Pod는 재생성될 때마다 IP가 바뀌므로, Service가 `app: order-api` 같은 라벨 셀렉터로 현재 살아 있고 준비된(Ready) Pod 목록을 추적한다. 클러스터 안에서는 `order-api.default.svc` 같은 이름으로 접근한다.',
          '- ClusterIP(기본): 클러스터 내부에서만 접근 가능한 IP. 서비스 간 통신에 쓴다.',
          '- NodePort: 모든 노드의 특정 포트(30000~32767)로 외부에서 접근하게 한다.',
          '- LoadBalancer: 클라우드 로드 밸런서를 만들어 외부 IP를 받는다. L4 수준이다.',
          '- 실제 분배는 각 노드의 kube-proxy가 iptables·IPVS 규칙으로 처리한다.'
        ],
        warn: ['HTTP 경로·호스트 기반 라우팅이나 TLS 종료가 필요하면 Service마다 LoadBalancer를 만들지 말고 Ingress 하나로 묶는다. LoadBalancer는 개당 비용이 든다.'],
        rel: ['Pod', 'Ingress', 'L4 로드 밸런서'] },
      { t: 'Ingress', deep: false,
        d: '클러스터 외부의 HTTP·HTTPS 요청을 호스트명과 URL 경로에 따라 내부 Service로 라우팅하는 L7 진입점 규칙이다.',
        how: [
          'Ingress 리소스는 규칙만 정의하고, 실제 처리는 Ingress Controller(NGINX Ingress, AWS Load Balancer Controller 등)가 한다.',
          '- `api.shop.com/orders` → order-service, `/users` → user-service처럼 경로 기반 라우팅을 한다.',
          '- TLS 인증서를 붙여 HTTPS를 종료한다.',
          '- 여러 서비스가 외부 진입점 하나를 공유해 로드 밸런서 비용을 줄인다.',
          '최근에는 Ingress의 후속 표준인 Gateway API로 옮겨 가는 추세다.'
        ],
        rel: ['K8s Service', 'L7 로드 밸런서', 'HTTPS'] }
    ]},
    { name: 'Kubernetes 운영', items: [
      { t: 'ConfigMap', deep: false,
        d: '환경 변수나 설정 파일처럼 민감하지 않은 설정값을 이미지와 분리해 저장하고 Pod에 주입하는 Kubernetes 리소스다.',
        how: [
          '같은 이미지를 개발·운영에서 설정만 바꿔 실행하기 위해 쓴다(12-Factor App의 설정 분리 원칙).',
          '- 환경 변수로 주입: `envFrom: configMapRef`로 키-값을 환경 변수로 넣는다. 스프링은 `SPRING_PROFILES_ACTIVE` 같은 환경 변수를 그대로 읽는다.',
          '- 파일로 마운트: application.yml 전체를 볼륨으로 마운트하고 `spring.config.import`로 읽는다.',
          '환경 변수로 넣은 값은 Pod를 재시작해야 바뀐다. 파일로 마운트한 값은 잠시 뒤 파일이 갱신되지만, 애플리케이션이 다시 읽어야 반영된다.'
        ],
        warn: ['비밀번호, 토큰은 ConfigMap에 넣지 않는다. 평문으로 누구나 조회할 수 있다.'],
        rel: ['K8s Secret', 'Pod'] },
      { t: 'K8s Secret', deep: false,
        d: '비밀번호, API 키, 인증서처럼 민감한 값을 저장해 Pod에 주입하는 Kubernetes 리소스다.',
        how: [
          '사용법은 ConfigMap과 같지만(환경 변수 주입, 파일 마운트), 접근 권한을 따로 제어하고 기본적으로 메모리(tmpfs)에 마운트한다.',
          '- 주의: 기본 저장 형식은 Base64 인코딩일 뿐 암호화가 아니다. etcd 저장 암호화를 켜고, RBAC로 조회 권한을 최소화한다.',
          '- 실무에서는 AWS Secrets Manager, HashiCorp Vault 같은 외부 시크릿 저장소를 External Secrets Operator로 동기화하는 방식을 많이 쓴다.',
          '- Secret YAML을 Git에 그대로 커밋하지 않는다. Sealed Secrets나 SOPS로 암호화해 관리한다.'
        ],
        warn: ['애플리케이션 로그나 Actuator `/env`에 Secret 값이 출력되지 않는지 확인한다.'],
        rel: ['ConfigMap', '최소 권한 원칙'] },
      { t: 'HPA', deep: false,
        d: 'Horizontal Pod Autoscaler. CPU 사용률 같은 지표를 보고 Deployment의 Pod 개수를 자동으로 늘리고 줄이는 기능이다.',
        how: [
          '1) metrics-server(또는 Prometheus 어댑터)가 Pod의 CPU·메모리 사용량을 수집한다.',
          '2) HPA가 주기적으로(기본 15초) 목표값과 비교해 필요한 Pod 수를 계산한다. 예: 목표 CPU 60%인데 평균 90%면 Pod를 1.5배로 늘린다.',
          '3) minReplicas~maxReplicas 범위 안에서 Deployment의 replicas를 바꾼다.',
          '- 사용률은 resources.requests 기준이므로 requests가 없으면 동작하지 않는다.',
          '- 요청 수(RPS), 큐 길이 같은 커스텀 지표로도 확장할 수 있다(KEDA).',
          '- Pod가 늘어도 노드가 부족하면 Cluster Autoscaler가 노드 자체를 늘린다.'
        ],
        warn: [
          'JVM 앱은 기동 직후 JIT 컴파일로 CPU를 많이 써서 HPA가 불필요하게 늘릴 수 있다. 안정화 시간(behavior.scaleUp.stabilizationWindowSeconds)을 둔다.',
          'Pod가 늘면 DB 커넥션 수도 늘어난다. Pod 수 × 커넥션 풀 크기가 DB 최대 연결 수를 넘지 않게 한다.'
        ],
        rel: ['오토스케일링', 'Deployment', '스케일 아웃'] },
      { t: 'liveness 프로브', deep: false,
        d: '컨테이너가 살아 있는지 주기적으로 검사해, 실패하면 kubelet이 컨테이너를 재시작하게 하는 헬스 체크다.',
        how: [
          '데드락이나 무한 대기처럼 프로세스는 살아 있지만 더는 요청을 처리하지 못하는 상태를 재시작으로 회복하기 위해 쓴다.',
          '- 방식: HTTP GET(200~399면 성공), TCP 연결, 명령 실행.',
          '- 스프링 부트: `management.endpoint.health.probes.enabled=true`(쿠버네티스 환경에서는 자동)로 `/actuator/health/liveness`를 쓴다.',
          '- 설정값: `initialDelaySeconds`, `periodSeconds`, `timeoutSeconds`, `failureThreshold`.',
          '- 기동이 느린 앱은 startupProbe를 따로 두어, 기동이 끝날 때까지 liveness 검사를 미룬다.'
        ],
        warn: ['liveness에 DB 연결 상태를 넣지 않는다. DB가 잠깐 끊기면 모든 Pod가 동시에 재시작되어 장애가 커진다. liveness는 프로세스 자체의 생존만 본다.'],
        rel: ['readiness 프로브', 'Pod'] },
      { t: 'readiness 프로브', deep: false,
        d: '컨테이너가 트래픽을 받을 준비가 되었는지 검사해, 실패하는 동안 Service의 트래픽 대상에서 빼는 헬스 체크다.',
        how: [
          '재시작은 하지 않고 트래픽만 끊는다는 점이 liveness와 다르다.',
          '- 기동 직후: 스프링 컨텍스트 초기화, 캐시 예열이 끝나기 전에는 Not Ready로 두어 요청을 받지 않는다.',
          '- 롤링 배포: 새 Pod가 Ready가 되어야 Deployment가 옛 Pod를 줄인다.',
          '- 종료 시: 스프링 부트는 종료가 시작되면 readiness를 REFUSING_TRAFFIC으로 바꿔 새 요청 유입을 막는다.',
          '- 스프링 부트 엔드포인트: `/actuator/health/readiness`. 필요하면 DB 같은 필수 의존성 상태를 readiness 그룹에 포함한다.'
        ],
        warn: ['readiness가 너무 엄격하면 외부 의존성의 일시 장애에 모든 Pod가 동시에 빠져 전체 서비스가 503이 된다. 정말 필수인 의존성만 포함한다.'],
        rel: ['liveness 프로브', 'Deployment', 'Graceful Shutdown'] }
    ]},
    { name: 'CI/CD', items: [
      { t: 'CI', deep: true,
        d: 'Continuous Integration. 개발자들이 코드를 자주 메인 브랜치에 합치고, 합칠 때마다 빌드와 테스트를 자동으로 실행해 문제를 빨리 찾는 방식이다.',
        why: '여러 사람이 오래 따로 개발한 코드를 한 번에 합치면 충돌과 버그가 몰려 원인을 찾기 어렵다(통합 지옥). 작게 자주 합치고 매번 자동 검증하면 문제가 생긴 커밋을 바로 알 수 있다.',
        how: [
          '1) 개발자가 브랜치에 push하거나 PR을 연다.',
          '2) CI 서버(GitHub Actions, Jenkins, GitLab CI)가 저장소를 받아 빌드한다.',
          '3) 단위 테스트, 통합 테스트(Testcontainers), 정적 분석(Checkstyle, SonarQube), 보안 스캔을 실행한다.',
          '4) 결과를 PR에 표시하고, 실패하면 머지를 막는다(브랜치 보호 규칙).',
          '5) 메인 브랜치에 머지되면 배포 가능한 산출물(JAR, Docker 이미지)을 만들어 레지스트리에 올린다.',
          '- 좋은 CI의 조건: 10분 이내로 빠르고, 결과가 매번 같으며(불안정한 테스트 제거), 깨지면 최우선으로 고친다.'
        ],
        code: `# .github/workflows/ci.yml
name: ci
on:
  pull_request:
  push:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: { distribution: temurin, java-version: '21', cache: gradle }
      - run: ./gradlew test
      - run: ./gradlew bootJar`,
        warn: [
          '가끔 실패하는 불안정한 테스트(flaky test)를 방치하면 모두가 CI 실패를 무시하게 된다. 원인을 고치거나 격리한다.',
          'CI 로그에 비밀값이 찍히지 않게 하고, 비밀값은 저장소의 Secrets 기능으로만 주입한다.'
        ],
        qa: ['CI/CD가 무엇이고 왜 필요한가요?', 'CI는 코드를 자주 합치면서 합칠 때마다 빌드와 테스트를 자동으로 돌려 통합 문제를 빨리 찾는 방식입니다. CD는 검증된 산출물을 배포 가능한 상태로 유지하거나 운영까지 자동 배포하는 것입니다. 사람이 수동으로 빌드하고 배포하면 실수가 생기고 배포가 무서워져 큰 단위로 드물게 하게 되는데, 자동화하면 작은 변경을 자주 안전하게 내보낼 수 있습니다.'],
        rel: ['CD', '배포 파이프라인', '컨테이너 레지스트리'] },
      { t: 'CD', deep: false,
        d: 'Continuous Delivery 또는 Continuous Deployment. CI를 통과한 산출물을 자동으로 배포 단계까지 이어 가는 방식이다.',
        how: [
          '- 지속적 전달(Delivery): 언제든 운영에 배포할 수 있는 상태를 자동으로 유지하고, 운영 배포 버튼은 사람이 누른다.',
          '- 지속적 배포(Deployment): 테스트를 통과하면 운영까지 사람 개입 없이 자동 배포한다.',
          '- 푸시 방식: CI 파이프라인이 `kubectl apply`나 배포 스크립트로 직접 배포한다.',
          '- GitOps(풀 방식): 배포할 상태(이미지 태그가 담긴 매니페스트)를 Git 저장소에 두고, 클러스터 안의 Argo CD·Flux가 Git과 클러스터를 계속 비교해 맞춘다. 배포 이력이 Git 커밋으로 남고, 되돌리기도 커밋 revert로 한다.',
          '자동 배포를 하려면 테스트 신뢰도, 모니터링, 빠른 롤백 수단이 먼저 갖춰져야 한다.'
        ],
        rel: ['CI', '배포 파이프라인', '롤백'] },
      { t: '배포 파이프라인', deep: false,
        d: '코드 변경이 운영에 나가기까지 거치는 빌드, 테스트, 배포 단계를 순서대로 자동화한 흐름이다.',
        how: [
          '대표적인 단계: 커밋 → 빌드 → 단위 테스트 → 정적 분석·보안 스캔 → 이미지 빌드·푸시 → 개발 환경 배포 → 통합·E2E 테스트 → 스테이징 배포 → 승인 → 운영 배포(카나리 등) → 배포 후 모니터링.',
          '- 앞 단계일수록 빠르고 싼 검사를, 뒤 단계일수록 느리고 실제에 가까운 검사를 둔다.',
          '- 한 번 만든 이미지를 모든 환경에 그대로 승격시킨다(환경마다 다시 빌드하지 않는다). 그래야 테스트한 것과 운영에 나간 것이 같다.',
          '- DB 스키마 변경은 Flyway·Liquibase 마이그레이션으로 파이프라인에 포함하고, 이전 버전 코드와도 호환되게(확장 후 축소) 나눠 배포한다.'
        ],
        rel: ['CI', 'CD', '카나리 배포'] },
      { t: 'IaC', deep: false,
        d: 'Infrastructure as Code. 서버, 네트워크, DB 같은 인프라를 콘솔에서 손으로 만들지 않고 코드로 정의해 생성·변경하는 방식이다.',
        how: [
          '- 도구: Terraform(여러 클라우드 지원, 선언형), AWS CloudFormation, Pulumi(일반 프로그래밍 언어 사용).',
          '- 장점: 인프라 변경도 코드 리뷰와 이력 관리를 거치고, 같은 환경을 여러 번 똑같이 만들 수 있으며, 장애 시 재구축이 빠르다.',
          '- 흐름(Terraform): 코드 작성 → `terraform plan`으로 변경 예정 사항 확인 → `terraform apply`로 반영. 현재 인프라 상태는 state 파일에 저장한다.',
          '콘솔에서 직접 고치면 코드와 실제 상태가 달라지는 드리프트가 생기므로, 모든 변경은 코드로만 한다.'
        ],
        warn: ['Terraform state 파일에는 비밀값이 들어갈 수 있다. 원격 저장소(S3 등)에 암호화해 두고 동시 수정을 막는 잠금을 건다.'],
        rel: ['CD'] }
    ]},
    { name: '배포 전략', items: [
      { t: '롤링 배포', deep: true,
        d: '서버(인스턴스)를 한 대 또는 일부씩 새 버전으로 차례로 교체해, 전체 서비스를 멈추지 않고 배포하는 방식이다.',
        why: '모든 서버를 한꺼번에 내리고 올리면(재생성 배포) 그동안 서비스가 중단된다. 추가 서버를 많이 준비하지 않고도 무중단으로 배포하기 위해 쓰며, Kubernetes Deployment의 기본 전략이다.',
        how: [
          '1) 로드 밸런서에서 서버 1대를 빼고(또는 새 버전 1대를 추가하고),',
          '2) 그 서버를 새 버전으로 교체한 뒤 헬스 체크를 통과하면 다시 트래픽을 준다.',
          '3) 이를 모든 서버가 교체될 때까지 반복한다.',
          '- 장점: 추가 자원이 거의 들지 않고, 문제가 보이면 중간에 멈출 수 있다.',
          '- 단점: 배포 중에는 옛 버전과 새 버전이 동시에 요청을 처리한다. 그래서 API와 DB 스키마가 두 버전 모두와 호환되어야 한다. 전체 교체에 시간이 걸리고, 롤백도 다시 롤링으로 진행되어 느리다.'
        ],
        code: `# Kubernetes 롤링 업데이트 설정
spec:
  replicas: 4
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1        # 최대 5개까지 잠시 늘어남
      maxUnavailable: 0  # 항상 4개는 서비스 가능

# 이미지 교체 → 롤링 시작
# kubectl set image deployment/order-api app=order-api:1.5.0`,
        warn: [
          '컬럼 이름 변경처럼 이전 버전과 호환되지 않는 DB 변경을 함께 배포하면, 배포 중 옛 버전 서버가 오류를 낸다. 컬럼 추가 → 코드 전환 → 옛 컬럼 삭제처럼 여러 번에 나눠 배포한다.',
          '세션을 서버 메모리에 두면 교체되는 서버의 사용자가 로그아웃된다. 세션은 외부 저장소에 둔다.'
        ],
        qa: ['롤링, 블루그린, 카나리 배포를 비교해 주세요.', '롤링은 서버를 일부씩 차례로 새 버전으로 바꿔 추가 자원이 적게 들지만, 배포 중 두 버전이 섞이고 롤백이 느립니다. 블루그린은 새 환경을 통째로 띄운 뒤 트래픽을 한 번에 전환해 롤백이 즉시 되지만 자원이 두 배 필요합니다. 카나리는 새 버전에 일부 트래픽만 보내 지표를 확인하며 점진적으로 늘리므로 위험이 가장 작지만, 트래픽 분할과 모니터링 체계가 필요합니다.'],
        rel: ['블루그린 배포', '카나리 배포', 'Deployment', '무중단 배포'] },
      { t: '블루그린 배포', deep: true,
        d: '현재 운영 중인 환경(블루)과 같은 구성의 새 환경(그린)을 따로 띄워 검증한 뒤, 트래픽을 한 번에 그린으로 전환하는 배포 방식이다.',
        why: '배포 중 두 버전이 섞이지 않게 하고, 문제가 생기면 트래픽만 블루로 되돌려 즉시 롤백하기 위해서다.',
        how: [
          '1) 블루(현재 버전)가 모든 트래픽을 처리하고 있다.',
          '2) 그린에 새 버전을 같은 규모로 배포한다. 아직 사용자 트래픽은 없다.',
          '3) 그린에 내부 테스트와 헬스 체크를 실행한다.',
          '4) 로드 밸런서나 Kubernetes Service의 대상을 블루에서 그린으로 바꾼다. 전환은 순식간이다.',
          '5) 일정 시간 지켜보다 문제가 없으면 블루를 내리고, 문제가 있으면 대상을 블루로 되돌린다.',
          '- 장점: 전환과 롤백이 즉시 되고, 배포 중 버전이 섞이지 않는다.',
          '- 단점: 전환 기간 동안 서버 자원이 두 배 필요하다. DB는 보통 하나를 공유하므로 스키마 호환 문제는 여전히 남는다.'
        ],
        code: `# Service의 selector만 바꿔 전환
apiVersion: v1
kind: Service
metadata: { name: order-api }
spec:
  selector:
    app: order-api
    version: green     # blue → green 으로 바꾸면 트래픽 전환
  ports: [{ port: 80, targetPort: 8080 }]

# 롤백: version 을 다시 blue 로`,
        warn: [
          '전환 순간 진행 중이던 요청과 연결(웹소켓 등)이 끊길 수 있다. 블루는 바로 지우지 말고 처리 중인 요청이 끝날 때까지 유지한다.',
          '배치 작업이나 메시지 소비자가 블루와 그린 양쪽에서 동시에 돌지 않게 한다.'
        ],
        qa: ['블루그린 배포의 장단점은 무엇인가요?', '새 버전을 별도 환경에 완전히 띄워 검증한 뒤 트래픽을 한 번에 전환하기 때문에, 배포 중 버전이 섞이지 않고 문제가 생기면 트래픽만 되돌려 즉시 롤백할 수 있습니다. 대신 전환 기간에는 운영 환경을 두 벌 유지해야 해서 비용이 두 배이고, 공유하는 DB의 스키마는 두 버전 모두와 호환되도록 관리해야 합니다.'],
        rel: ['롤링 배포', '카나리 배포', '롤백'] },
      { t: '카나리 배포', deep: true,
        d: '새 버전에 전체 트래픽 중 일부(예: 5%)만 먼저 보내 오류율과 지연 시간을 확인하고, 문제가 없으면 비율을 점점 늘리는 배포 방식이다.',
        why: '테스트 환경에서 잡히지 않는 문제는 실제 트래픽에서야 드러난다. 문제가 있더라도 일부 사용자만 영향을 받게 해 피해 범위(blast radius)를 줄이기 위해서다. 이름은 탄광에서 유독가스를 먼저 감지하던 카나리아에서 왔다.',
        how: [
          '1) 새 버전을 소수의 인스턴스로 띄우고 트래픽의 1~5%만 보낸다.',
          '2) 오류율, 응답 시간(p99), 비즈니스 지표(주문 성공률)를 기존 버전과 비교한다.',
          '3) 기준을 만족하면 25% → 50% → 100%로 늘리고, 기준을 벗어나면 트래픽을 0%로 돌려 중단한다.',
          '- 트래픽 분할 방법: 로드 밸런서 가중치, 서비스 메시(Istio), Argo Rollouts·Flagger 같은 점진 배포 도구.',
          '- 분할 기준: 무작위 비율, 특정 사용자 그룹(사내 직원, 특정 지역), 헤더 값.',
          '- 자동 분석을 붙이면 지표가 나빠질 때 사람 개입 없이 자동 롤백된다.'
        ],
        code: `# Argo Rollouts 카나리 단계 예시
spec:
  strategy:
    canary:
      steps:
        - setWeight: 5
        - pause: { duration: 10m }   # 지표 확인
        - setWeight: 25
        - pause: { duration: 10m }
        - setWeight: 50
        - pause: { duration: 10m }
        - setWeight: 100`,
        warn: [
          '트래픽이 적은 서비스는 5%로는 통계적으로 의미 있는 비교가 어렵다. 관찰 시간을 늘리거나 비율을 조정한다.',
          '같은 사용자가 요청마다 옛 버전과 새 버전을 오가면 화면이 섞일 수 있다. 사용자 단위로 고정(sticky)하는 분할을 쓴다.'
        ],
        qa: ['카나리 배포는 언제 쓰나요?', '테스트로 다 검증하기 어려운 변경을 실제 트래픽으로 안전하게 확인하고 싶을 때 씁니다. 새 버전에 트래픽 일부만 보내 오류율과 응답 시간을 기존 버전과 비교하고, 괜찮으면 비율을 점점 늘립니다. 문제가 생겨도 영향받는 사용자가 일부에 그치고, 지표 기반으로 자동 롤백까지 걸 수 있다는 것이 장점입니다.'],
        rel: ['롤링 배포', '블루그린 배포', '메트릭'] },
      { t: '롤백', deep: false,
        d: '배포한 새 버전에 문제가 생겼을 때 직전의 정상 버전으로 되돌리는 것이다.',
        how: [
          '- 이미지 롤백: 이전 이미지 태그로 다시 배포한다. Kubernetes는 `kubectl rollout undo`, 블루그린은 트래픽 재전환, GitOps는 Git 커밋 revert로 한다.',
          '- 롤 포워드: 되돌리는 대신 빠르게 수정 버전을 배포하는 방법. 롤백이 불가능한 변경(데이터 변환)에 쓴다.',
          '- 기능 플래그: 코드는 배포하되 새 기능을 설정으로 켜고 끈다. 문제가 생기면 재배포 없이 플래그만 꺼 즉시 되돌린다.',
          '롤백을 쉽게 하려면 이미지를 버전 태그로 남기고, DB 마이그레이션은 이전 버전 코드와 호환되게(되돌릴 수 있게) 작성한다.'
        ],
        warn: ['DB 스키마나 데이터를 바꾼 배포는 코드만 되돌려도 해결되지 않는다. 배포 전에 데이터 롤백 방법(백업, 역마이그레이션)을 정해 둔다.'],
        rel: ['블루그린 배포', 'Deployment', 'CD'] },
      { t: '무중단 배포', deep: false,
        d: '배포하는 동안에도 사용자 요청이 실패하지 않도록 서비스를 계속 유지하며 새 버전으로 교체하는 것이다.',
        how: [
          '배포 전략(롤링, 블루그린, 카나리)만으로는 부족하고, 다음 요소가 함께 맞아야 실제로 요청이 끊기지 않는다.',
          '- 새 인스턴스: readiness 체크를 통과한 뒤에만 트래픽을 받는다.',
          '- 옛 인스턴스: 트래픽 대상에서 먼저 빠진 뒤, 처리 중인 요청을 마치고 종료한다(graceful shutdown).',
          '- 호환성: 두 버전이 동시에 떠 있는 동안 API, 메시지 형식, DB 스키마가 서로 호환된다.',
          '- 상태: 세션과 파일을 서버 밖에 두어 어느 인스턴스로 가도 같은 결과가 나온다.',
          '- 장기 연결: 웹소켓이나 긴 요청은 재연결 로직을 클라이언트에 둔다.'
        ],
        rel: ['Graceful Shutdown', 'readiness 프로브', '롤링 배포', '무상태 서버'] },
      { t: 'Graceful Shutdown', deep: true,
        d: '애플리케이션이 종료 신호를 받으면 새 요청은 받지 않고, 이미 처리 중인 요청과 작업을 마친 뒤 자원을 정리하고 종료하는 방식이다.',
        why: '배포나 오토스케일링으로 인스턴스가 내려갈 때 처리 중이던 요청이 강제로 끊기면 사용자에게 오류가 나고, 결제처럼 중간에 끊긴 작업은 데이터 정합성 문제를 남긴다.',
        how: [
          'Kubernetes에서 Pod가 종료될 때의 흐름:',
          '1) Pod가 Terminating 상태가 되고, 동시에 Service 엔드포인트에서 제거가 시작된다.',
          '2) preStop 훅이 있으면 먼저 실행된다. 엔드포인트 제거가 모든 노드에 전파될 시간을 벌기 위해 몇 초 sleep하는 경우가 많다.',
          '3) 컨테이너 PID 1 프로세스에 SIGTERM을 보낸다.',
          '4) 스프링 부트(`server.shutdown=graceful`)는 새 요청을 거절하고, 진행 중 요청이 끝나기를 `timeout-per-shutdown-phase`만큼 기다린 뒤 빈을 정리(커넥션 풀 닫기 등)한다.',
          '5) `terminationGracePeriodSeconds`(기본 30초)가 지나도 안 끝나면 SIGKILL로 강제 종료된다.',
          '- 메시지 소비자는 새 메시지 수신을 멈추고 처리 중인 메시지를 마친 뒤 오프셋을 커밋한다.',
          '- 스케줄러·비동기 작업은 `spring.task.execution.shutdown.await-termination=true`로 끝날 때까지 기다리게 한다.'
        ],
        code: `# application.yml
server:
  shutdown: graceful
spring:
  lifecycle:
    timeout-per-shutdown-phase: 20s

# Pod spec
terminationGracePeriodSeconds: 40
containers:
  - name: app
    lifecycle:
      preStop:
        exec: { command: ["sh", "-c", "sleep 5"] }`,
        warn: [
          'Dockerfile ENTRYPOINT를 셸 형식으로 쓰면 SIGTERM이 자바 프로세스에 전달되지 않아 graceful shutdown이 동작하지 않는다. exec 형식을 쓴다.',
          '`terminationGracePeriodSeconds`는 preStop 시간 + 스프링 종료 대기 시간보다 길어야 한다. 짧으면 중간에 SIGKILL로 끊긴다.'
        ],
        qa: ['Graceful Shutdown은 왜 필요하고 어떻게 구현하나요?', '인스턴스가 내려갈 때 처리 중인 요청이 끊기지 않게 하려고 씁니다. 종료 신호인 SIGTERM을 받으면 새 요청은 거절하고 진행 중인 요청과 작업을 마친 뒤 자원을 정리하고 종료합니다. 스프링 부트는 server.shutdown=graceful과 대기 시간 설정으로 지원하고, 쿠버네티스에서는 preStop으로 엔드포인트 제거가 전파될 시간을 벌고 terminationGracePeriodSeconds를 그보다 넉넉히 잡습니다.'],
        rel: ['무중단 배포', 'readiness 프로브', 'Dockerfile'] }
    ]},
    { name: '클라우드 기본', items: [
      { t: '리전', deep: false,
        d: '클라우드 사업자가 데이터센터를 운영하는 지리적 지역 단위다. 예: AWS 서울 리전(ap-northeast-2).',
        how: [
          '- 리전끼리는 물리적으로 멀리 떨어져 있고 독립적으로 운영되어, 한 리전의 대형 장애나 재해가 다른 리전에 번지지 않는다.',
          '- 리전 선택 기준: 사용자와의 거리(지연 시간), 데이터 보관 규제(개인정보를 국내에 둬야 하는 경우), 서비스 제공 여부, 가격.',
          '- 리전 간 데이터 전송은 비용이 들고 지연 시간이 크므로, 보통 한 리전 안에서 서비스하고 재해 복구(DR)용으로 다른 리전에 백업을 둔다.'
        ],
        rel: ['가용 영역'] },
      { t: '가용 영역', deep: false,
        d: 'Availability Zone(AZ). 한 리전 안에서 전원, 냉각, 네트워크가 독립된 하나 이상의 데이터센터 묶음이다.',
        how: [
          '- 한 리전에는 보통 3개 이상의 AZ가 있고, AZ끼리는 저지연 전용망으로 연결되어 있다.',
          '- 고가용성 설계의 기본은 서버와 DB를 여러 AZ에 나눠 두는 것이다(Multi-AZ). 한 AZ가 정전되어도 다른 AZ의 인스턴스가 서비스를 계속한다.',
          '- 로드 밸런서는 여러 AZ의 인스턴스에 트래픽을 나누고, RDS Multi-AZ는 다른 AZ에 대기 DB를 두고 장애 시 자동 전환한다.',
          '- Kubernetes에서는 Pod 분산 규칙(topologySpreadConstraints)으로 Pod를 AZ별로 고르게 배치한다.'
        ],
        warn: ['AZ 간 트래픽에도 전송 비용이 붙는다. 트래픽이 많은 서비스끼리 AZ를 계속 넘나들지 않도록 배치를 고려한다.'],
        rel: ['리전', '오토스케일링'] },
      { t: '오토스케일링', deep: false,
        d: '트래픽이나 자원 사용량에 따라 서버(인스턴스) 수를 자동으로 늘리고 줄이는 기능이다.',
        how: [
          '- 동적 스케일링: CPU 사용률, 요청 수 같은 지표가 목표를 넘으면 늘리고 내려가면 줄인다(목표 추적).',
          '- 예약 스케일링: 매일 오전 9시처럼 예측 가능한 피크 전에 미리 늘린다.',
          '- 예측 스케일링: 과거 패턴을 학습해 미리 늘린다.',
          '- 구성 요소: 시작 템플릿(어떤 이미지·사양으로 띄울지), 최소·최대·희망 개수, 헬스 체크, 쿨다운 시간.',
          '수평 확장(서버 수 늘리기)이 가능하려면 서버가 무상태여야 하고, 새 인스턴스가 빨리 뜨고 바로 트래픽을 받을 수 있어야 한다.'
        ],
        warn: [
          '인스턴스가 뜨고 JVM이 예열되는 데 몇 분이 걸린다. 급증하는 트래픽에는 늦을 수 있으므로 최소 대수에 여유를 둔다.',
          '애플리케이션 서버만 늘면 DB가 병목이 된다. 커넥션 수와 DB 용량을 함께 계산한다.'
        ],
        rel: ['HPA', '스케일 아웃', '무상태 서버'] }
    ]}
  ],
  must: [
    '컨테이너는 호스트 커널을 공유하므로 VM보다 격리가 약하다. root로 실행하지 않고 필요한 권한만 준다.',
    'JVM 컨테이너는 메모리 제한을 꼭 걸고 `-XX:MaxRAMPercentage`로 힙 비율을 정한다. 제한을 넘으면 OOMKilled로 강제 종료된다.',
    '`latest` 태그로 배포하지 않는다. 버전 태그나 다이제스트로 고정해야 추적과 롤백이 가능하다.',
    'readiness 프로브와 graceful shutdown을 함께 설정해야 배포 중 요청이 끊기지 않는다.',
    '비밀번호·API 키는 이미지나 Git에 넣지 말고 Secret이나 시크릿 매니저로 주입한다.'
  ]
};
