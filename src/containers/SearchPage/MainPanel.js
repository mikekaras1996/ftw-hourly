import React, { Component } from 'react';
import { array, bool, func, number, object, objectOf, string } from 'prop-types';
import { FormattedMessage } from '../../util/reactIntl';
import classNames from 'classnames';
import merge from 'lodash/merge';
import { propTypes } from '../../util/types';
import {
  SearchResultsPanel,
  SearchFilters,
  SearchFiltersMobile,
  SearchFiltersPanel,
} from '../../components';
import { validFilterParams } from './SearchPage.helpers';

import css from './SearchPage.css';

class MainPanel extends Component {
  constructor(props) {
    super(props);
    this.state = { isSearchFiltersPanelOpen: false };
  }

  render() {
    const {
      className,
      rootClassName,
      urlQueryParams,
      sort,
      listings,
      searchInProgress,
      searchListingsError,
      searchParamsAreInSync,
      onActivateListing,
      onManageDisableScrolling,
      onOpenModal,
      onCloseModal,
      onMapIconClick,
      pagination,
      searchParamsForPagination,
      showAsModalMaxWidth,
      primaryFilters,
      secondaryFilters,
    } = this.props;

    const isSearchFiltersPanelOpen = !!secondaryFilters && this.state.isSearchFiltersPanelOpen;

    const filters = merge({}, primaryFilters, secondaryFilters);
    const selectedFilters = validFilterParams(urlQueryParams, filters);
    const selectedFiltersCount = Object.keys(selectedFilters).length;

    const selectedSecondaryFilters = secondaryFilters
      ? validFilterParams(urlQueryParams, secondaryFilters)
      : {};
    const searchFiltersPanelSelectedCount = Object.keys(selectedSecondaryFilters).length;

    const searchFiltersPanelProps = !!secondaryFilters
      ? {
          isSearchFiltersPanelOpen: this.state.isSearchFiltersPanelOpen,
          toggleSearchFiltersPanel: isOpen => {
            this.setState({ isSearchFiltersPanelOpen: isOpen });
          },
          searchFiltersPanelSelectedCount,
        }
      : {};

    // With time-based availability filtering, pagination is NOT
    // supported. In these cases we get the pagination support info in
    // the response meta object, and we can use the count of listings
    // as the result count.
    //
    // See: https://www.sharetribe.com/api-reference/marketplace.html#availability-filtering
    const hasPaginationInfo = !!pagination && !pagination.paginationUnsupported;
    const listingsLength = listings ? listings.length : 0;
    const totalItems =
      searchParamsAreInSync && hasPaginationInfo ? pagination.totalItems : listingsLength;

    const listingsAreLoaded = !searchInProgress && searchParamsAreInSync;

    const classes = classNames(rootClassName || css.searchResultContainer, className);

    const filterParamNames = Object.values(filters).map(f => f.paramName);
    const secondaryFilterParamNames = secondaryFilters
      ? Object.values(secondaryFilters).map(f => f.paramName)
      : [];

    return (
      <div className={classes}>
        <SearchFilters
          className={css.searchFilters}
          urlQueryParams={urlQueryParams}
          sort={sort}
          listingsAreLoaded={listingsAreLoaded}
          resultsCount={totalItems}
          searchInProgress={searchInProgress}
          searchListingsError={searchListingsError}
          onManageDisableScrolling={onManageDisableScrolling}
          {...searchFiltersPanelProps}
          {...primaryFilters}
        />
        <SearchFiltersMobile
          className={css.searchFiltersMobile}
          urlQueryParams={urlQueryParams}
          sort={sort}
          listingsAreLoaded={listingsAreLoaded}
          resultsCount={totalItems}
          searchInProgress={searchInProgress}
          searchListingsError={searchListingsError}
          showAsModalMaxWidth={showAsModalMaxWidth}
          onMapIconClick={onMapIconClick}
          onManageDisableScrolling={onManageDisableScrolling}
          onOpenModal={onOpenModal}
          onCloseModal={onCloseModal}
          filterParamNames={filterParamNames}
          selectedFiltersCount={selectedFiltersCount}
          {...primaryFilters}
          {...secondaryFilters}
        />
        {isSearchFiltersPanelOpen ? (
          <div className={classNames(css.searchFiltersPanel)}>
            <SearchFiltersPanel
              urlQueryParams={urlQueryParams}
              sort={sort}
              listingsAreLoaded={listingsAreLoaded}
              onClosePanel={() => this.setState({ isSearchFiltersPanelOpen: false })}
              filterParamNames={secondaryFilterParamNames}
              {...secondaryFilters}
            />
          </div>
        ) : (
          <div
            className={classNames(css.listings, {
              [css.newSearchInProgress]: !listingsAreLoaded,
            })}
          >
            {searchListingsError ? (
              <h2 className={css.error}>
                <FormattedMessage id="SearchPage.searchError" />
              </h2>
            ) : null}
            <SearchResultsPanel
              className={css.searchListingsPanel}
              listings={listings}
              pagination={listingsAreLoaded ? pagination : null}
              search={searchParamsForPagination}
              setActiveListing={onActivateListing}
            />
          </div>
        )}
      </div>
    );
  }
}

MainPanel.defaultProps = {
  className: null,
  rootClassName: null,
  listings: [],
  resultsCount: 0,
  pagination: null,
  searchParamsForPagination: {},
  primaryFilters: null,
  secondaryFilters: null,
};

MainPanel.propTypes = {
  className: string,
  rootClassName: string,

  urlQueryParams: object.isRequired,
  listings: array,
  searchInProgress: bool.isRequired,
  searchListingsError: propTypes.error,
  searchParamsAreInSync: bool.isRequired,
  onActivateListing: func.isRequired,
  onManageDisableScrolling: func.isRequired,
  onOpenModal: func.isRequired,
  onCloseModal: func.isRequired,
  onMapIconClick: func.isRequired,
  pagination: propTypes.pagination,
  searchParamsForPagination: object,
  showAsModalMaxWidth: number.isRequired,
  primaryFilters: objectOf(propTypes.filterConfig),
  secondaryFilters: objectOf(propTypes.filterConfig),
};

export default MainPanel;
