from __future__ import annotations

from pathlib import Path
import csv


PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATASETS_ROOT = PROJECT_ROOT / 'datasets'

EXPECTED_DATASETS = {
    'olistbr_brazilian-ecommerce': {
        'required_files': {
            'olist_orders_dataset.csv',
            'olist_order_items_dataset.csv',
            'olist_customers_dataset.csv',
        },
        'primary_csv': 'olist_orders_dataset.csv',
    },
    'ziya07_smart-logistics-supply-chain-dataset': {
        'required_files': {'smart_logistics_dataset.csv'},
        'primary_csv': 'smart_logistics_dataset.csv',
    },
}


def _read_header_and_first_row(csv_path: Path) -> tuple[list[str], list[str]]:
    with csv_path.open('r', encoding='utf-8', newline='') as handle:
        reader = csv.reader(handle)
        header = next(reader)
        first_row = next(reader)
    return header, first_row


def test_expected_dataset_directories_and_required_files_exist() -> None:
    assert DATASETS_ROOT.exists(), 'datasets directory is missing'

    for dataset_name, spec in EXPECTED_DATASETS.items():
        dataset_dir = DATASETS_ROOT / dataset_name
        assert dataset_dir.exists(), f'missing dataset directory: {dataset_dir}'

        files = {path.name for path in dataset_dir.glob('*') if path.is_file()}
        assert spec['required_files'].issubset(files), (
            f'missing required files for {dataset_name}: '
            f"{sorted(spec['required_files'] - files)}"
        )


def test_primary_csv_files_are_readable_and_non_empty() -> None:
    for dataset_name, spec in EXPECTED_DATASETS.items():
        csv_path = DATASETS_ROOT / dataset_name / spec['primary_csv']
        assert csv_path.exists(), f'missing CSV file: {csv_path}'

        header, first_row = _read_header_and_first_row(csv_path)

        assert header, f'CSV header is empty for {csv_path}'
        assert first_row, f'CSV first data row is empty for {csv_path}'
        assert any(cell.strip() for cell in first_row), (
            f'CSV first data row contains only empty values for {csv_path}'
        )
