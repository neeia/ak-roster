export interface OperatorSupport {
  module: { [key: string]: number | undefined } | null
  op_id: string
  skill: number
  slot: number
}