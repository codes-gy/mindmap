import Link from 'next/link';
import { SearchBox } from './SearchBox';

export function Header() {
  return (
    <header className="site-head">
      <div className="head-row">
        <div>
          <p className="eyebrow">Spring · CS · 네트워크 · 자료구조 · 알고리즘</p>
          <h1><Link href="/">마인드맵</Link></h1>
        </div>
        <SearchBox />
      </div>
      <p className="lead">스프링 핵심 개념, 운영체제·데이터베이스 같은 CS 기초, 배열·해시·트리·그래프를 다루는 자료구조, TCP부터 라우팅·소켓 I/O·클라우드 네트워크까지 다루는 네트워크, 그리고 복잡도부터 DP·세그먼트 트리·자바 코딩테스트 요령까지 담은 알고리즘을 개념 하나씩 나눠 정리했습니다. 면접에 자주 나오는 개념은 심화로 표시하고 동작 원리, 코드, 모범 답변까지 담았습니다.</p>
    </header>
  );
}
