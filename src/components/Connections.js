import React from 'react';
import ContentHeader from 'c/ContentHeader';
import ConnectionTable from 'c/ConnectionTable';
import useRemainingViewPortHeight from '../hooks/useRemainingViewPortHeight';
import { useStoreState } from 'm/store';
import { getClashAPIConfig } from 'd/app';
import { X as IconClose } from 'react-feather';
import SvgYacd from './SvgYacd';
import { ButtonWithIcon } from './Button';
import ModalCloseAllConnections from './ModalCloseAllConnections';
import * as connAPI from '../api/connections';

import s from './Connections.module.css';

const { useEffect, useState, useRef, useCallback, useMemo } = React;

const paddingBottom = 30;

function formatConnectionDataItem(i) {
  const { id, metadata, upload, download, start, chains, rule } = i;
  // const started = formatDistance(new Date(start), now);
  return {
    id,
    upload,
    download,
    start: 0 - new Date(start),
    chains: chains.reverse().join(' / '),
    rule,
    ...metadata
  };
}

function Conn() {
  const [refContainer, containerHeight] = useRemainingViewPortHeight();
  const config = useStoreState(getClashAPIConfig);
  const [conns, setConns] = useState([]);
  const [isCloseAllModalOpen, setIsCloseAllModalOpen] = useState(false);
  const openCloseAllModal = useCallback(() => setIsCloseAllModalOpen(true), []);
  const closeCloseAllModal = useCallback(
    () => setIsCloseAllModalOpen(false),
    []
  );
  const closeAllConnections = useCallback(() => {
    connAPI.closeAllConnections(config);
    closeCloseAllModal();
  }, [config, closeCloseAllModal]);
  const iconClose = useMemo(() => <IconClose width={16} />, []);
  const prevConnsRef = useRef(conns);
  useEffect(() => {
    function read({ connections }) {
      const x = connections.map(c => formatConnectionDataItem(c));
      // if previous connections and current connections are both empty
      // arrays, we wont update state to avaoid rerender
      if (x && (x.length !== 0 || prevConnsRef.current.length !== 0)) {
        prevConnsRef.current = x;
        setConns(x);
      } else {
        prevConnsRef.current = x;
      }
    }
    return connAPI.fetchData(config, read);
  }, [config]);
  return (
    <div>
      <ContentHeader title="Connections" />
      <div
        ref={refContainer}
        style={{ padding: 30, paddingBottom, paddingTop: 0 }}
      >
        <div
          style={{ height: containerHeight - paddingBottom, overflow: 'auto' }}
        >
          {conns.length > 0 ? (
            <ConnectionTable data={conns} />
          ) : (
            <div className={s.placeHolder}>
              <SvgYacd width={200} height={200} c1="var(--color-text)" />
            </div>
          )}
        </div>
      </div>
      <div className="fabgrp">
        <ButtonWithIcon
          text="Close"
          icon={iconClose}
          onClick={openCloseAllModal}
        />
      </div>
      <ModalCloseAllConnections
        isOpen={isCloseAllModalOpen}
        primaryButtonOnTap={closeAllConnections}
        onRequestClose={closeCloseAllModal}
      />
    </div>
  );
}

export default Conn;