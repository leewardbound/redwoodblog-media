export type ValidatorRulesModule = {
  [key: string]: (value: any, existing?: any) => any
}

export function validateFields<T>(
  rulesModule: ValidatorRulesModule,
  data: T
): T {
  Object.keys(data).map((field) => {
    if (Object.keys(rulesModule).includes(field)) {
      data[field] = rulesModule[field](data[field])
    }
  })
  return data
}

export function validateCreate<T>(
  rulesModule: ValidatorRulesModule,
  data: T
): T {
  data = validateFields<T>(rulesModule, data)

  /* First we run the root validator */
  if (Object.keys(rulesModule).includes('root')) {
    data = rulesModule.root(data)
  }

  /* Finally we run the creation validator */
  if (Object.keys(rulesModule).includes('create')) {
    data = rulesModule.create(data)
  }
  return data
}
export function validateUpdate<T>(
  rulesModule: ValidatorRulesModule,
  data: T,
  existing: { [key: string]: any }
): T {
  data = validateFields<T>(rulesModule, data)

  /* First we run the root validator */
  if (Object.keys(rulesModule).includes('root')) {
    data = rulesModule.root(data)
  }

  /* Finally we run the update validator */
  if (Object.keys(rulesModule).includes('update')) {
    data = rulesModule.update(data, existing)
  }
  return data
}
