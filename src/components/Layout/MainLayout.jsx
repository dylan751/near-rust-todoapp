import React from 'react';
import { Layout, Button, Dropdown, Menu } from 'antd';
import { login, logout, wallet } from '../../utils/near';
import { matchPath, useLocation, Link, useHistory } from 'react-router-dom';
// @ts-ignore
import logo from '../../assets/favicon.ico';
// @ts-ignore
import near from '../../assets/favicon.ico';

import {
  DownOutlined,
  UserOutlined,
  LogoutOutlined,
  SolutionOutlined,
  MenuOutlined,
  DollarOutlined,
} from '@ant-design/icons';

const { Header, Content, Footer } = Layout;

// const MainLayout = (props: any) => {
const MainLayout = (props) => {
  const location = useLocation();
  const history = useHistory();
  const isSelected = (pattern) => {
    return matchPath(location.pathname, {
      exact: true,
      strict: false,
      path: pattern,
    });
  };

  return (
    <div>
      <Layout
        className={'bg-color sm:px-0 md:px-3 xl:px-5 lg:px-5'}
        style={{ minHeight: '100vh' }}
      >
        <Header
          className={
            'padding-0-15 flex flex-row text-white justify-center items-center bg-color border-b border-gray-900'
          }
        >
          <div style={{ width: 150 }}>
            <Link to={'/'} className={'flex justify-start items-center'}>
              <img
                src={logo}
                style={{ width: 40, height: 40, marginRight: 15 }}
                alt=""
              />
              <span className={'text-2xl font-extrabold sm:hidden xs:hidden'}>
                ZNG DEV
              </span>
            </Link>
          </div>
          <div className={'flex-1 xs:hidden sm:hidden md:hidden'}>
            <ul className={'flex flex-row justify-center items-center mb-0'}>
              <li>
                <Link
                  className={`p-4 text-lg
                   text-gray-400 cursor-pointer`}
                  to={'/'}
                >
                  Swap
                </Link>
              </li>
              <li>
                <Link
                  className={`p-4 text-lg  text-gray-400 cursor-pointer`}
                  to={'/pools'}
                >
                  Pools
                </Link>
              </li>
              <li>
                <Link
                  className={`p-4 text-lg  text-gray-400 cursor-pointer`}
                  to={'/staking'}
                >
                  Staking
                </Link>
              </li>
              <li>
                <Link
                  className={`p-4 text-lg  text-gray-400 cursor-pointer`}
                  to={'/faucet'}
                >
                  Faucet
                </Link>
              </li>
              <li>
                <Link
                  className={`p-4 text-lg  text-gray-400 cursor-pointer`}
                  to={'/nft'}
                >
                  NFTs
                </Link>
              </li>
              <li>
                <Link
                  className={`p-4 text-lg  text-gray-400 cursor-pointer`}
                  to={'/wrap-near'}
                >
                  Wrap NEAR
                </Link>
              </li>
            </ul>
          </div>
          <div
            className={
              'xs:flex-1 sm:flex-1 md:flex-1 flex justify-end items-center'
            }
            style={{ width: 140 }}
          >
            {wallet.isSignedIn() ? (
              <Button
              onClick={() => logout()}
              className={
                'flex justify-center items-center ant-button-hover-white'
              }
              shape="round"
            >
              <div className={'flex justify-center items-center'}>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9.62451 0.609359L7.11711 4.33336C7.0765 4.3871 7.05769 4.45426 7.06455 4.52129C7.07138 4.58836 7.10332 4.65033 7.15397 4.69475C7.20463 4.7392 7.27018 4.76277 7.33751 4.7608C7.4048 4.75879 7.46888 4.73135 7.51681 4.68401L9.98423 2.55069C9.99844 2.53763 10.0162 2.52904 10.0352 2.52598C10.0543 2.52292 10.0738 2.52553 10.0914 2.53348C10.109 2.54143 10.1239 2.55438 10.1342 2.57071C10.1445 2.58704 10.1498 2.60604 10.1494 2.62535V9.33066C10.1492 9.35102 10.1428 9.37084 10.1311 9.38745C10.1193 9.40407 10.1028 9.4167 10.0837 9.42366C10.0646 9.43062 10.0437 9.43157 10.0241 9.42639C10.0044 9.4212 9.98679 9.41014 9.97356 9.39468L2.51271 0.461356C2.3936 0.31794 2.24459 0.202334 2.07612 0.122641C1.90765 0.0429479 1.72381 0.0010978 1.53747 2.50247e-05H1.27767C0.938812 2.50247e-05 0.613831 0.134741 0.37422 0.374536C0.134611 0.614332 0 0.939566 0 1.27869V10.7213C0 11.0605 0.134611 11.3857 0.37422 11.6255C0.613831 11.8653 0.938812 12 1.27767 12C1.49601 12 1.7107 11.944 1.90125 11.8373C2.0918 11.7306 2.25186 11.5768 2.36616 11.3907L4.87354 7.66668C4.91418 7.61291 4.93295 7.54578 4.92613 7.47871C4.91927 7.41168 4.88732 7.34971 4.83667 7.30526C4.78605 7.26084 4.72047 7.23724 4.65317 7.23924C4.58584 7.24125 4.52177 7.26866 4.47384 7.31602L2.00644 9.44933C1.99221 9.4624 1.97447 9.471 1.95541 9.47405C1.93635 9.47711 1.91681 9.47448 1.89923 9.46653C1.88163 9.45859 1.86676 9.44566 1.85645 9.42931C1.84614 9.41299 1.84085 9.39399 1.84123 9.37469V2.67602C1.84143 2.65566 1.84784 2.63585 1.85959 2.61923C1.87134 2.60261 1.88788 2.58998 1.907 2.58303C1.92612 2.57607 1.9469 2.57512 1.96658 2.5803C1.98625 2.58548 2.00387 2.59654 2.01709 2.61202L9.47794 11.5453C9.59795 11.6875 9.74751 11.8017 9.91621 11.88C10.0849 11.9582 10.2686 11.9988 10.4545 11.9987H10.721C10.8888 11.9987 11.0549 11.9656 11.2099 11.9013C11.3649 11.8371 11.5058 11.7429 11.6244 11.6242C11.7431 11.5054 11.8372 11.3645 11.9014 11.2093C11.9656 11.0542 11.9986 10.8879 11.9986 10.72V1.27869C11.9987 1.1101 11.9653 0.94317 11.9006 0.787509C11.8359 0.631851 11.7411 0.490536 11.6216 0.371697C11.5021 0.252857 11.3603 0.158839 11.2044 0.0950521C11.0484 0.0312655 10.8814 -0.0010297 10.713 2.50247e-05C10.4946 5.12861e-05 10.28 0.056073 10.0894 0.162744C9.89884 0.269415 9.73878 0.423179 9.62451 0.609359Z"
                    fill="white"
                  ></path>
                </svg>
                <span className={'mr-3 ml-2'}>Logout</span>
              </div>
            </Button>
            ) : (
              <Button
                onClick={() => login()}
                className={
                  'flex justify-center items-center ant-button-hover-white'
                }
                shape="round"
              >
                <div className={'flex justify-center items-center'}>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9.62451 0.609359L7.11711 4.33336C7.0765 4.3871 7.05769 4.45426 7.06455 4.52129C7.07138 4.58836 7.10332 4.65033 7.15397 4.69475C7.20463 4.7392 7.27018 4.76277 7.33751 4.7608C7.4048 4.75879 7.46888 4.73135 7.51681 4.68401L9.98423 2.55069C9.99844 2.53763 10.0162 2.52904 10.0352 2.52598C10.0543 2.52292 10.0738 2.52553 10.0914 2.53348C10.109 2.54143 10.1239 2.55438 10.1342 2.57071C10.1445 2.58704 10.1498 2.60604 10.1494 2.62535V9.33066C10.1492 9.35102 10.1428 9.37084 10.1311 9.38745C10.1193 9.40407 10.1028 9.4167 10.0837 9.42366C10.0646 9.43062 10.0437 9.43157 10.0241 9.42639C10.0044 9.4212 9.98679 9.41014 9.97356 9.39468L2.51271 0.461356C2.3936 0.31794 2.24459 0.202334 2.07612 0.122641C1.90765 0.0429479 1.72381 0.0010978 1.53747 2.50247e-05H1.27767C0.938812 2.50247e-05 0.613831 0.134741 0.37422 0.374536C0.134611 0.614332 0 0.939566 0 1.27869V10.7213C0 11.0605 0.134611 11.3857 0.37422 11.6255C0.613831 11.8653 0.938812 12 1.27767 12C1.49601 12 1.7107 11.944 1.90125 11.8373C2.0918 11.7306 2.25186 11.5768 2.36616 11.3907L4.87354 7.66668C4.91418 7.61291 4.93295 7.54578 4.92613 7.47871C4.91927 7.41168 4.88732 7.34971 4.83667 7.30526C4.78605 7.26084 4.72047 7.23724 4.65317 7.23924C4.58584 7.24125 4.52177 7.26866 4.47384 7.31602L2.00644 9.44933C1.99221 9.4624 1.97447 9.471 1.95541 9.47405C1.93635 9.47711 1.91681 9.47448 1.89923 9.46653C1.88163 9.45859 1.86676 9.44566 1.85645 9.42931C1.84614 9.41299 1.84085 9.39399 1.84123 9.37469V2.67602C1.84143 2.65566 1.84784 2.63585 1.85959 2.61923C1.87134 2.60261 1.88788 2.58998 1.907 2.58303C1.92612 2.57607 1.9469 2.57512 1.96658 2.5803C1.98625 2.58548 2.00387 2.59654 2.01709 2.61202L9.47794 11.5453C9.59795 11.6875 9.74751 11.8017 9.91621 11.88C10.0849 11.9582 10.2686 11.9988 10.4545 11.9987H10.721C10.8888 11.9987 11.0549 11.9656 11.2099 11.9013C11.3649 11.8371 11.5058 11.7429 11.6244 11.6242C11.7431 11.5054 11.8372 11.3645 11.9014 11.2093C11.9656 11.0542 11.9986 10.8879 11.9986 10.72V1.27869C11.9987 1.1101 11.9653 0.94317 11.9006 0.787509C11.8359 0.631851 11.7411 0.490536 11.6216 0.371697C11.5021 0.252857 11.3603 0.158839 11.2044 0.0950521C11.0484 0.0312655 10.8814 -0.0010297 10.713 2.50247e-05C10.4946 5.12861e-05 10.28 0.056073 10.0894 0.162744C9.89884 0.269415 9.73878 0.423179 9.62451 0.609359Z"
                      fill="white"
                    ></path>
                  </svg>
                  <span className={'mr-3 ml-2'}>Login with NEAR</span>
                </div>
              </Button>
            )}
            <MenuOutlined className={'ml-3 lg:hidden'} />
          </div>
        </Header>
        <Content className={'w-full'}>{props.children}</Content>
      </Layout>
    </div>
  );
};

export default MainLayout;
