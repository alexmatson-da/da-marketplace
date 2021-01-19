import React from 'react'
import { Table } from 'semantic-ui-react'
import classNames from 'classnames'

type CellItem = string | React.ReactElement;

type Props = {
    className?: string;
    header: CellItem[];
    rows: React.ReactElement[];
}

const StripedTable: React.FC<Props> = ({ className, header, rows }) => {
    return (
        <Table fixed className={classNames('striped-table', className)}>
            <Table.Header className='striped-table-header'>
                    <Table.Row className='striped-table-row'>
                        { header.map((headerCell, index) => (
                            <Table.HeaderCell key={index} className='striped-table-cell'>
                                { headerCell }
                            </Table.HeaderCell>))}
                    </Table.Row>
                </Table.Header>

            <Table.Body className='striped-table-body'>
                { rows }
            </Table.Body>
        </Table>
    )
}

export default StripedTable;
