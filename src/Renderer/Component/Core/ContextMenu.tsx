import React from 'react';
import styled from 'styled-components';
import {appTheme} from '../../Style/appTheme';
import {border, space} from '../../Style/layout';
import {BrowserViewIPC} from '../../../IPC/BrowserViewIPC';
import {ClickView} from './ClickView';
import {color} from '../../Style/color';
import {Text} from './Text';
import {View} from './View';
import {IconNameType} from '../../Type/IconNameType';
import {Icon} from './Icon';

export type ContextMenuType = {
  type?: 'item' | 'separator';
  icon?: IconNameType;
  label?: string;
  handler?: () => void;
  hide?: boolean;
}

type Props = {
  show: boolean;
  pos: {top: number; left: number};
  onClose: () => void;
  menus: ContextMenuType[];
  hideBrowserView?: boolean;
}

type State = {
}

export class ContextMenu extends React.Component<Props, State> {
  static defaultProps = {hideBrowserView: true};

  componentDidMount() {
    window.addEventListener('keydown', this.handleKeyDownBind);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyDownBind);
  }

  private handleKeyDownBind = (ev: KeyboardEvent) => {
    if (this.props.show && ev.key === 'Escape') this.handleClose();
  }

  private handleClose() {
    this.props.onClose();
    BrowserViewIPC.hide(false);
  }

  private handleMenu(menu: ContextMenuType) {
    this.handleClose();
    menu.handler();
  }

  render() {
    if (!this.props.show) return null;

    if (this.props.hideBrowserView) BrowserViewIPC.hide(true);

    const {top, left} = this.props.pos;

    return (
      <Root onClick={() => this.handleClose()} onContextMenu={() => this.handleClose()}>
        <Body onClick={() => null} style={{top, left}}>
          {this.renderMenus()}
        </Body>
      </Root>
    );
  }

  renderMenus() {
    return this.props.menus.map((menu, index) => {
      if (menu.hide) return;

      if (menu.type === 'separator') return <MenuSeparator key={index}/>;

      let icon;
      if (menu.icon) {
        icon = <MenuIcon name={menu.icon}/>;
      }

      return (
        <MenuRow onClick={this.handleMenu.bind(this, menu)} key={index} className='context-menu-row'>
          {icon}
          <MenuLabel>{menu.label}</MenuLabel>
        </MenuRow>
      )
    });
  }
}

const Root = styled(ClickView)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  cursor: initial;
`;

const Body = styled(ClickView)`
  position: fixed;
  top: 0;
  left: 0;
  background: ${() => appTheme().bg};
  padding: 0 0 ${space.small}px;
  border: solid ${border.medium}px ${() => appTheme().borderColor};
  box-shadow: 0 0 8px 4px #00000010;
  border-radius: 6px;
`;

const MenuRow = styled(ClickView)`
  flex-direction: row;
  align-items: center;
  margin-top: ${space.small}px;
  padding: 1px ${space.large}px;
  
  &:hover {
    background: ${() => appTheme().contextMenuHover};
  }
`;

const MenuLabel = styled(Text)`
  .context-menu-row:hover & {
    color: ${color.white};
  }
`;

const MenuIcon = styled(Icon)`
  margin-right: ${space.small2}px;
  
  .context-menu-row:hover & {
    color: ${color.white};
  }
`;

const MenuSeparator = styled(View)`
  margin-top: ${space.small}px;
  height: ${border.medium}px;
  width: 100%;
  background: ${() => appTheme().borderColor};
`;
