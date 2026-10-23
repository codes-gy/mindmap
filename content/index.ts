// scripts/convert.ts가 만든 파일이다. 주제를 추가하면 import와 topics 배열에 직접 이어서 적는다
import type { Tab } from './types';
import spring_0 from './spring/spring-0';
import spring_1 from './spring/spring-1';
import spring_2 from './spring/spring-2';
import spring_3 from './spring/spring-3';
import spring_4 from './spring/spring-4';
import spring_5 from './spring/spring-5';
import spring_6 from './spring/spring-6';
import spring_7 from './spring/spring-7';
import spring_8 from './spring/spring-8';
import spring_9 from './spring/spring-9';
import spring_10 from './spring/spring-10';
import spring_11 from './spring/spring-11';
import spring_12 from './spring/spring-12';
import cs_2 from './cs/cs-2';
import cs_4 from './cs/cs-4';
import cs_5 from './cs/cs-5';
import cs_6 from './cs/cs-6';
import cs_7 from './cs/cs-7';
import cs_8 from './cs/cs-8';
import cs_9 from './cs/cs-9';
import cs_10 from './cs/cs-10';
import cs_11 from './cs/cs-11';
import cs_13 from './cs/cs-13';
import cs_14 from './cs/cs-14';
import cs_15 from './cs/cs-15';
import cs_17 from './cs/cs-17';
import net_0 from './net/net-0';
import net_1 from './net/net-1';
import net_2 from './net/net-2';
import net_3 from './net/net-3';
import net_4 from './net/net-4';
import net_5 from './net/net-5';
import ds_0 from './ds/ds-0';
import ds_1 from './ds/ds-1';
import ds_2 from './ds/ds-2';
import algo_0 from './algo/algo-0';
import algo_1 from './algo/algo-1';
import algo_2 from './algo/algo-2';
import algo_3 from './algo/algo-3';
import algo_4 from './algo/algo-4';
import algo_5 from './algo/algo-5';

export const TABS: Tab[] = [
  { key: 'spring', title: 'Spring', root: 'Spring', topics: [spring_0, spring_1, spring_2, spring_3, spring_4, spring_5, spring_6, spring_7, spring_8, spring_9, spring_10, spring_11, spring_12] },
  { key: 'cs', title: 'CS 기초', root: 'CS', topics: [cs_2, cs_4, cs_5, cs_6, cs_7, cs_8, cs_9, cs_10, cs_11, cs_13, cs_14, cs_15, cs_17] },
  { key: 'net', title: '네트워크', root: 'Network', topics: [net_0, net_1, net_2, net_3, net_4, net_5] },
  { key: 'ds', title: '자료구조', root: '자료구조', topics: [ds_0, ds_1, ds_2] },
  { key: 'algo', title: '알고리즘', root: 'Algorithm', topics: [algo_0, algo_1, algo_2, algo_3, algo_4, algo_5] },
];
