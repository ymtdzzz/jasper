import {DB} from '../DB/DB';
import {DateConverter} from '../../Util/DateConverter';
import {StreamIPC} from '../../IPC/StreamIPC';

class _SaveAndLoadStreams {
  async save() {
    const output = [];
    const {rows: streams} = await DB.select('select * from streams order by position');
    const {rows: filters} = await DB.select('select * from filtered_streams order by stream_id, position');

    for (const stream of streams) {
      const _filters = filters.filter(v => v.stream_id === stream.id);
      output.push({stream, filters: _filters});
    }

    return output;
  }

  async load(data) {
    const res1 = await DB.selectSingle('select max(id) + 1 as id, count(1) as count from streams');
    let {id: streamIndex, count: streamCount} = res1.row;
    streamIndex = streamIndex || 1;

    const res2 = await DB.selectSingle('select max(id) + 1 as id, count(1) as count from filtered_streams');
    let {id: filterIndex, count: filterCount} = res2.row;
    filterIndex = filterIndex || 1;

    let position = streamCount + filterCount;
    const now = DateConverter.localToUTCString(new Date());

    for (const {stream, filters} of data) {
      await DB.exec(`
        insert
          into streams
            (id, name, queries, position, notification, color, created_at, updated_at)
          values
            (?, ?, ?, ?, ?, ?, ?, ?)
        `, [streamIndex, stream.name, stream.queries, position, stream.notification, stream.color, now, now]);
      position++;

      for (const filter of filters) {
        await DB.exec(`
          insert
            into filtered_streams
              (id, stream_id, name, filter, notification, color, position, created_at, updated_at)
            values
              (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [filterIndex, streamIndex, filter.name, filter.filter, filter.notification, filter.color, position, now, now]);
        filterIndex++;
        position++;
      }

      streamIndex++;
    }

    StreamIPC.restartAllStreams();
  }
}

export const SaveAndLoadStreams = new _SaveAndLoadStreams();
